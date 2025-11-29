#!/usr/bin/env python3
"""
Document processor for extracting text content from Office files
Supports: .docx, .pptx, .xlsx files
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

try:
    from docx import Document
    from pptx import Presentation
    from openpyxl import load_workbook
except ImportError as e:
    print(f"Error: Missing required package: {e}", file=sys.stderr)
    print("Please install: pip install python-docx python-pptx openpyxl", file=sys.stderr)
    sys.exit(1)


class DocumentProcessor:
    """Processes various document types and extracts text content"""
    
    SUPPORTED_EXTENSIONS = {
        '.docx': 'word',
        '.doc': 'word',  # Note: .doc requires additional library
        '.pptx': 'powerpoint',
        '.ppt': 'powerpoint',  # Note: .ppt requires additional library
        '.xlsx': 'excel',
        '.xls': 'excel',  # Note: .xls requires additional library
    }
    
    def __init__(self):
        self.stats = {
            'total_files': 0,
            'processed': 0,
            'failed': 0,
            'skipped': 0
        }
    
    def calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file for duplicate detection"""
        sha256_hash = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except Exception as e:
            print(f"Error hashing file {file_path}: {e}", file=sys.stderr)
            return ""
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from Word document"""
        try:
            doc = Document(file_path)
            text_parts = []
            
            # Extract from paragraphs
            for para in doc.paragraphs:
                if para.text.strip():
                    text_parts.append(para.text)
            
            # Extract from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            text_parts.append(cell.text)
            
            return "\n".join(text_parts)
        except Exception as e:
            raise Exception(f"Error extracting from Word doc: {e}")
    
    def extract_text_from_pptx(self, file_path: str) -> str:
        """Extract text from PowerPoint presentation"""
        try:
            prs = Presentation(file_path)
            text_parts = []
            
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        text_parts.append(shape.text)
                    
                    # Extract from tables in slides
                    if shape.has_table:
                        for row in shape.table.rows:
                            for cell in row.cells:
                                if cell.text.strip():
                                    text_parts.append(cell.text)
            
            return "\n".join(text_parts)
        except Exception as e:
            raise Exception(f"Error extracting from PowerPoint: {e}")
    
    def extract_text_from_xlsx(self, file_path: str) -> str:
        """Extract text from Excel spreadsheet"""
        try:
            wb = load_workbook(file_path, read_only=True, data_only=True)
            text_parts = []
            
            for sheet_name in wb.sheetnames:
                sheet = wb[sheet_name]
                text_parts.append(f"Sheet: {sheet_name}")
                
                for row in sheet.iter_rows(values_only=True):
                    row_text = " | ".join([str(cell) if cell is not None else "" for cell in row])
                    if row_text.strip():
                        text_parts.append(row_text)
            
            wb.close()
            return "\n".join(text_parts)
        except Exception as e:
            raise Exception(f"Error extracting from Excel: {e}")
    
    def process_file(self, file_path: str) -> Optional[Dict]:
        """Process a single file and extract metadata and content"""
        self.stats['total_files'] += 1
        
        try:
            path_obj = Path(file_path)
            
            # Check if file exists and is accessible
            if not path_obj.exists():
                print(f"File not found: {file_path}", file=sys.stderr)
                self.stats['skipped'] += 1
                return None
            
            if not path_obj.is_file():
                self.stats['skipped'] += 1
                return None
            
            # Get file extension
            ext = path_obj.suffix.lower()
            if ext not in self.SUPPORTED_EXTENSIONS:
                self.stats['skipped'] += 1
                return None
            
            # Get file stats
            file_stat = path_obj.stat()
            file_size = file_stat.st_size
            modified_time = datetime.fromtimestamp(file_stat.st_mtime)
            
            # Calculate file hash
            file_hash = self.calculate_file_hash(file_path)
            
            # Extract text content based on file type
            text_content = ""
            file_type = self.SUPPORTED_EXTENSIONS[ext]
            
            if ext == '.docx':
                text_content = self.extract_text_from_docx(file_path)
            elif ext == '.pptx':
                text_content = self.extract_text_from_pptx(file_path)
            elif ext == '.xlsx':
                text_content = self.extract_text_from_xlsx(file_path)
            else:
                # For .doc, .ppt, .xls we'd need additional libraries
                print(f"Unsupported format (needs conversion): {ext}", file=sys.stderr)
                self.stats['skipped'] += 1
                return None
            
            self.stats['processed'] += 1
            
            return {
                'fileName': path_obj.name,
                'filePath': str(path_obj.absolute()),
                'fileSize': file_size,
                'fileType': ext[1:],  # Remove the dot
                'fileHash': file_hash,
                'extractedText': text_content[:50000],  # Limit to 50k chars
                'modifiedAt': modified_time.isoformat(),
                'processingStatus': 'completed'
            }
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}", file=sys.stderr)
            self.stats['failed'] += 1
            return {
                'fileName': Path(file_path).name,
                'filePath': str(Path(file_path).absolute()),
                'fileSize': 0,
                'fileType': Path(file_path).suffix[1:],
                'fileHash': '',
                'extractedText': '',
                'modifiedAt': datetime.now().isoformat(),
                'processingStatus': 'failed',
                'processingError': str(e)
            }
    
    def scan_folder(self, folder_path: str, recursive: bool = True) -> List[Dict]:
        """Scan a folder and process all supported documents"""
        results = []
        path_obj = Path(folder_path)
        
        if not path_obj.exists() or not path_obj.is_dir():
            print(f"Invalid folder path: {folder_path}", file=sys.stderr)
            return results
        
        # Get all files
        if recursive:
            pattern = "**/*"
        else:
            pattern = "*"
        
        for file_path in path_obj.glob(pattern):
            if file_path.is_file():
                ext = file_path.suffix.lower()
                if ext in self.SUPPORTED_EXTENSIONS:
                    result = self.process_file(str(file_path))
                    if result:
                        results.append(result)
        
        return results
    
    def get_stats(self) -> Dict:
        """Get processing statistics"""
        return self.stats


def main():
    """Main entry point for command-line usage"""
    if len(sys.argv) < 2:
        print("Usage: python document_processor.py <folder_path> [--no-recursive]")
        print("Output: JSON array of processed documents")
        sys.exit(1)
    
    folder_path = sys.argv[1]
    recursive = "--no-recursive" not in sys.argv
    
    processor = DocumentProcessor()
    results = processor.scan_folder(folder_path, recursive=recursive)
    
    # Output results as JSON
    output = {
        'documents': results,
        'stats': processor.get_stats()
    }
    
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
