# Building Sorto for Windows

## Prerequisites

### Required Software
1. **Windows 10 or 11** (64-bit)
2. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
3. **pnpm** - Install globally:
   ```powershell
   npm install -g pnpm
   ```
4. **Python 3.11** - Download from [python.org](https://www.python.org/downloads/)
5. **Git** - Download from [git-scm.com](https://git-scm.com/)

### Python Packages
After installing Python, open PowerShell and run:
```powershell
pip install python-docx python-pptx openpyxl PyPDF2
```

## Build Steps

### 1. Clone or Download the Project
```powershell
# If using Git:
git clone [your-repository-url]
cd doc_organizer

# Or extract the ZIP file and navigate to the folder
```

### 2. Install Dependencies
```powershell
pnpm install
```

This will take a few minutes to download all required packages.

### 3. Build the Windows Installer
```powershell
pnpm electron:build:win
```

This command will:
- Build the frontend (React + Vite)
- Build the backend (Express + tRPC)
- Package everything with Electron
- Create a Windows installer

The build process takes 5-10 minutes.

### 4. Find Your Installer

The installer will be created in the `release` folder:
```
doc_organizer/
└── release/
    └── Sorto Setup 1.0.0.exe  ← Your installer!
```

## Testing the Installer

1. Double-click `Sorto Setup 1.0.0.exe`
2. Follow the installation wizard
3. Launch Sorto from the Start Menu or Desktop shortcut
4. Test document scanning with your Turtle House folder

## Troubleshooting

### "Python not found" Error
- Make sure Python is added to PATH during installation
- Restart PowerShell after installing Python
- Verify with: `python --version`

### "pnpm not found" Error
- Run: `npm install -g pnpm`
- Restart PowerShell
- Verify with: `pnpm --version`

### Build Fails with "Out of Memory"
- Close other applications
- Increase Node.js memory:
  ```powershell
  $env:NODE_OPTIONS="--max-old-space-size=4096"
  pnpm electron:build:win
  ```

### Installer Won't Run
- Right-click the .exe → Properties → Unblock
- Windows Defender might flag it (it's not signed yet)
- Click "More info" → "Run anyway"

## Code Signing (Optional)

To remove Windows Defender warnings, you need a code signing certificate:

1. Purchase a certificate from:
   - DigiCert
   - Sectigo
   - GlobalSign

2. Update `package.json`:
   ```json
   "build": {
     "win": {
       "certificateFile": "path/to/certificate.pfx",
       "certificatePassword": "your-password"
     }
   }
   ```

3. Rebuild: `pnpm electron:build:win`

## Distribution

### For Beta Testing
- Upload `Sorto Setup 1.0.0.exe` to:
  - Google Drive
  - Dropbox
  - Your website
- Share the download link

### For Production
- Set up automatic updates (see AUTO_UPDATE.md)
- Use Gumroad or Stripe for license key delivery
- Host the installer on your domain

## Next Steps

After successful build:
1. Test on a clean Windows machine
2. Get feedback from beta users
3. Set up license key validation
4. Configure auto-updates
5. Submit to Microsoft Store (optional)

## Support

If you encounter issues:
1. Check the error message carefully
2. Search for the error on Google
3. Ask in the Electron Discord: https://discord.gg/electron
4. Open an issue on GitHub
