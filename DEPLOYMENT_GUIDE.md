# Document Organizer - Deployment Guide

## Overview

This guide explains how to deploy the Document Organizer as a desktop application on your Windows computer.

## Quick Start (For Testing on Your Laptop)

### Prerequisites

Before you start, make sure you have:

1. **Python 3.11 or later** installed
   - Download from: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"

2. **Node.js 22 or later** installed
   - Download from: https://nodejs.org/
   - Use the LTS (Long Term Support) version

3. **pnpm** package manager
   - After installing Node.js, open Command Prompt and run:
   ```
   npm install -g pnpm
   ```

### Step 1: Download the Project

1. Download the entire project folder to your computer
2. Extract it to a location like `C:\DocumentOrganizer`

### Step 2: Install Dependencies

Open Command Prompt in the project folder and run:

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install python-docx python-pptx openpyxl pillow
```

### Step 3: Set Up the Database

```bash
# Push the database schema
pnpm db:push
```

### Step 4: Build the Application

```bash
# Build the frontend
pnpm run build
```

### Step 5: Run the Application

#### Option A: Using the Batch File (Easiest)

1. Navigate to the `desktop` folder
2. Double-click `DocumentOrganizer.bat`
3. The application will start and open in your browser

#### Option B: Using Command Line

```bash
# From the project root
python desktop/launcher.py
```

### Step 6: Test with Your Documents

1. Once the application opens in your browser, sign in
2. Go to "Documents" page
3. Enter your folder path: `D:\A Turtle House MAin Stuff\AAA FILES AI\AAA SINTRA`
4. Click "Scan Folder"
5. Wait for the AI to process your documents

## Creating a Distributable Package

To create a version you can share or sell to others, follow these steps:

### Method 1: ZIP Package (Simple)

1. Build the application (see Step 4 above)
2. Copy these folders/files to a new directory:
   ```
   - client/ (built files)
   - server/
   - desktop/
   - drizzle/
   - package.json
   - README.md
   ```
3. Create a ZIP file
4. Include installation instructions (from desktop/README.md)

### Method 2: Windows Installer (Professional)

For a professional installer, you'll need additional tools:

#### Using PyInstaller (for Python launcher)

```bash
# Install PyInstaller
pip install pyinstaller

# Create executable
cd desktop
pyinstaller --onefile --windowed --name DocumentOrganizer launcher.py
```

#### Using Electron (for complete package)

This would package everything including Node.js runtime:

```bash
# Install electron-builder
npm install -g electron-builder

# Create Windows installer
# (Requires additional configuration - see electron-builder docs)
```

#### Using Inno Setup (for installer)

1. Download Inno Setup: https://jrsoftware.org/isinfo.php
2. Create an installer script (`.iss` file)
3. Include all application files
4. Generate `DocumentOrganizerSetup.exe`

## Configuration for Production

### Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/documents.db
```

### Database Location

For desktop deployment, the database should be in a user-writable location:

**Windows**: `%APPDATA%\DocumentOrganizer\database.db`

Update the database connection in `server/_core/env.ts` to use this path in production.

### License Validation

The license system is already built into the application:

1. Users get a 7-day free trial automatically
2. After trial, they need to enter a license key
3. License keys are validated (currently accepts any valid format)
4. To integrate real payment:
   - Add Stripe or PayPal integration
   - Generate license keys on purchase
   - Validate keys against your backend API

## Testing Checklist

Before distributing, test these scenarios:

- [ ] Fresh installation on a clean Windows machine
- [ ] Scanning a folder with 10-20 documents
- [ ] Scanning a folder with 100+ documents
- [ ] Search functionality
- [ ] Duplicate detection
- [ ] License key activation
- [ ] Trial expiration
- [ ] Application restart (data persists)
- [ ] Uninstallation (clean removal)

## Distribution Checklist

Before selling/distributing:

- [ ] Add your branding (logo, company name)
- [ ] Update contact information in README
- [ ] Set up payment processing (Stripe/PayPal)
- [ ] Create license key generation system
- [ ] Set up support email/website
- [ ] Create marketing materials
- [ ] Write EULA (End User License Agreement)
- [ ] Test on multiple Windows versions
- [ ] Create demo video or screenshots
- [ ] Set up analytics (optional)

## Pricing Recommendations

Based on similar products:

- **Free Trial**: 7 days (already implemented)
- **Monthly**: $9.99/month
- **Yearly**: $99/year (save 17%)
- **Lifetime**: $199 one-time

## Support & Maintenance

### User Support

Set up:
1. Support email (e.g., support@yourdomain.com)
2. FAQ page
3. Video tutorials
4. User forum or Discord

### Updates

To push updates:
1. Create new version with bug fixes/features
2. Increment version number
3. Notify users via email or in-app notification
4. Provide download link for new version

## Legal Considerations

Before selling:

1. **EULA**: Create an End User License Agreement
2. **Privacy Policy**: Explain data handling (all local, no cloud)
3. **Terms of Service**: Define usage terms
4. **Copyright**: Register your copyright
5. **Trademark**: Consider trademarking the name

## Marketing Suggestions

Target audience:
- Small business owners
- Consultants
- Architects (like yourself!)
- Lawyers, accountants
- Researchers, academics
- Anyone with document chaos

Marketing channels:
- Product Hunt launch
- Reddit (r/productivity, r/software)
- LinkedIn posts
- YouTube demo video
- Blog post about document organization
- Email to your network

## Technical Support

Common issues and solutions are documented in `desktop/README.md`.

For development questions, refer to the main project README.

---

## Next Steps

1. **Test the application** with your own documents
2. **Gather feedback** from a few beta users
3. **Refine the UI/UX** based on feedback
4. **Set up payment processing**
5. **Create marketing materials**
6. **Launch!**

Good luck with your product! 🚀
