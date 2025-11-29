#!/usr/bin/env python3
"""
Document Text Extractor
Extracts text content from various document formats:
- Word (.docx, .doc)
- PowerPoint (.pptx, .ppt)
- Excel (.xlsx, .xls)
- PDF (.pdf)
"""

import sys
import json
from pathlib import Path

def extract_from_docx(file_path):
    """Extract text from Word .docx files"""
    try:
        from docx import Document
        doc = Document(file_path)
        text_parts = []
        
        # Extract from paragraphs
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text)
        
        # Extract from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        text_parts.append(cell.text)
        
        return "\n".join(text_parts)
    except Exception as e:
        return f"Error extracting from DOCX: {str(e)}"

def extract_from_pptx(file_path):
    """Extract text from PowerPoint .pptx files"""
    try:
        from pptx import Presentation
        prs = Presentation(file_path)
        text_parts = []
        
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    text_parts.append(shape.text)
        
        return "\n".join(text_parts)
    except Exception as e:
        return f"Error extracting from PPTX: {str(e)}"

def extract_from_xlsx(file_path):
    """Extract text from Excel .xlsx files"""
    try:
        from openpyxl import load_workbook
        wb = load_workbook(file_path, data_only=True)
        text_parts = []
        
        for sheet in wb.worksheets:
            text_parts.append(f"Sheet: {sheet.title}")
            for row in sheet.iter_rows(values_only=True):
                row_text = " | ".join(str(cell) if cell is not None else "" for cell in row)
                if row_text.strip():
                    text_parts.append(row_text)
        
        return "\n".join(text_parts)
    except Exception as e:
        return f"Error extracting from XLSX: {str(e)}"

def extract_from_pdf(file_path):
    """Extract text from PDF files"""
    try:
        import PyPDF2
        text_parts = []
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text.strip():
                    text_parts.append(text)
        
        return "\n".join(text_parts)
    except Exception as e:
        return f"Error extracting from PDF: {str(e)}"

def extract_from_doc(file_path):
    """Extract text from old Word .doc files using antiword"""
    try:
        import subprocess
        result = subprocess.run(
            ['antiword', file_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return result.stdout
        else:
            return f"Error extracting from DOC: {result.stderr}"
    except FileNotFoundError:
        return "Error: antiword not installed. Cannot extract from .doc files."
    except Exception as e:
        return f"Error extracting from DOC: {str(e)}"

def extract_text(file_path):
    """Main extraction function - routes to appropriate extractor"""
    path = Path(file_path)
    
    if not path.exists():
        return {"error": f"File not found: {file_path}"}
    
    extension = path.suffix.lower()
    
    extractors = {
        '.docx': extract_from_docx,
        '.pptx': extract_from_pptx,
        '.xlsx': extract_from_xlsx,
        '.xls': extract_from_xlsx,  # openpyxl can handle .xls too
        '.pdf': extract_from_pdf,
        '.doc': extract_from_doc,
        '.ppt': lambda p: "Error: .ppt format not supported. Please convert to .pptx",
        '.txt': lambda p: Path(p).read_text(encoding='utf-8', errors='ignore'),
    }
    
    extractor = extractors.get(extension)
    
    if not extractor:
        return {"error": f"Unsupported file type: {extension}"}
    
    try:
        text = extractor(file_path)
        return {
            "success": True,
            "text": text,
            "file_name": path.name,
            "file_type": extension[1:],  # Remove the dot
            "char_count": len(text)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "file_name": path.name,
            "file_type": extension[1:]
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python document_extractor.py <file_path>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = extract_text(file_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
