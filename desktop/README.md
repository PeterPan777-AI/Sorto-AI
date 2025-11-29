# Document Organizer - Desktop Application

## Overview

Document Organizer is an intelligent document management system that runs locally on your Windows computer. It uses AI to automatically scan, tag, and organize your documents (Word, PowerPoint, Excel) while detecting duplicates and similar versions.

## Features

- **AI-Powered Tagging**: Automatically classifies and tags documents based on content
- **Duplicate Detection**: Finds exact duplicates and similar versions
- **Smart Search**: Full-text search across all your documents
- **Local Processing**: All documents stay on your computer - nothing uploaded to the cloud
- **7-Day Free Trial**: Try all features before purchasing
- **Professional UI**: Clean, modern web interface

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10 or later (64-bit)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 500 MB for application + space for your documents
- **Internet**: Required for initial setup and license validation only

### Software Dependencies (Included in Installer)
- Python 3.11+
- Node.js 22+
- Required Python packages (python-docx, python-pptx, openpyxl)

## Installation

### Option 1: Using the Installer (Recommended)

1. Download `DocumentOrganizerSetup.exe`
2. Double-click to run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### Option 2: Manual Installation

1. Extract the ZIP file to a folder (e.g., `C:\Program Files\DocumentOrganizer`)
2. Run `install_dependencies.bat` to install required packages
3. Double-click `DocumentOrganizer.exe` to launch

## First-Time Setup

1. **Launch the Application**
   - Use the desktop shortcut or Start Menu entry
   - The application will start a local web server
   - Your default browser will open automatically

2. **Sign In**
   - Click "Get Started" to create your account
   - Your 7-day free trial begins automatically

3. **Scan Your First Folder**
   - Click "Browse Documents" in the sidebar
   - Enter a folder path (e.g., `D:\My Documents`)
   - Click "Scan Folder"
   - Wait for the AI to analyze your documents

## Usage Guide

### Scanning Documents

1. Navigate to **Documents** page
2. Enter the full path to your folder in the scan box
3. Click **Scan Folder**
4. The system will:
   - Recursively scan all subfolders
   - Extract text from Word, PowerPoint, and Excel files
   - Use AI to automatically tag and categorize each document
   - Detect duplicates and similar versions
   - Store everything in the local database

**Supported File Types:**
- Word: `.docx` (`.doc` requires conversion)
- PowerPoint: `.pptx` (`.ppt` requires conversion)
- Excel: `.xlsx` (`.xls` requires conversion)

### Searching Documents

1. Use the search bar on the **Documents** page
2. Search by:
   - File name
   - Content (full-text search)
   - Document type
   - Tags and categories

### Managing Duplicates

1. Navigate to **Duplicates** page
2. Review groups of similar documents
3. Each group shows:
   - Similarity percentage
   - File sizes
   - Modification dates
4. Mark groups as "Resolved" when done

### License Management

1. Navigate to **Settings** page
2. View your trial status or subscription details
3. Enter a license key to activate (format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)
4. Upgrade to Pro for unlimited access

## Folder Path Examples

### Windows Paths
```
D:\My Documents\Projects
C:\Users\YourName\Documents\Work
E:\Archive\2024
```

**Tips:**
- Use full paths with drive letters
- Paths are not case-sensitive on Windows
- Spaces in folder names are supported
- Use backslashes (\) or forward slashes (/)

## Troubleshooting

### Application Won't Start

1. Check if port 3000 is available
2. Try running as Administrator
3. Check Windows Firewall settings
4. Review logs in `%APPDATA%\DocumentOrganizer\logs`

### Scan Fails or Hangs

1. Ensure you have read permissions for the folder
2. Check if files are not locked by other applications
3. Try scanning a smaller folder first
4. Check available disk space

### Documents Not Found

1. Verify the folder path is correct
2. Ensure files are supported formats (.docx, .pptx, .xlsx)
3. Check file permissions
4. Try refreshing the page

### Browser Doesn't Open

1. Manually open your browser
2. Navigate to: `http://localhost:3000`
3. Bookmark this URL for future use

## Data Storage

All data is stored locally on your computer:

- **Database**: `%APPDATA%\DocumentOrganizer\database.db`
- **Configuration**: `%APPDATA%\DocumentOrganizer\config.json`
- **Logs**: `%APPDATA%\DocumentOrganizer\logs\`

**Note**: Your original documents are never moved or modified. The application only reads and indexes them.

## Uninstallation

### Using the Installer
1. Go to Windows Settings > Apps
2. Find "Document Organizer"
3. Click Uninstall

### Manual Uninstallation
1. Delete the application folder
2. Delete `%APPDATA%\DocumentOrganizer` to remove all data
3. Remove desktop shortcuts

## Pricing

- **Free Trial**: 7 days, full features
- **Pro License**: $9.99/month
  - Unlimited document scanning
  - Advanced AI tagging
  - Duplicate detection
  - Priority support
  - Regular updates

## Support

For questions, issues, or feature requests:
- Email: support@example.com
- Website: https://example.com/support

## Privacy & Security

- **Local Processing**: All documents stay on your computer
- **No Cloud Upload**: Documents are never uploaded anywhere
- **Secure**: Database is stored locally with no external access
- **License Validation**: Only license status is checked online (no document data sent)

## Version History

### Version 1.0.0 (2025)
- Initial release
- AI-powered document tagging
- Duplicate detection
- Full-text search
- 7-day free trial
- License management

## License

Copyright © 2025. All rights reserved.

This software is licensed for use under the terms of the End User License Agreement (EULA).

---

**Document Organizer** - Intelligent document management powered by AI
