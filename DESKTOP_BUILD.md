# Sorto Desktop App - Build Instructions

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Python 3.11 installed (for document processing)
- Python packages: `pip3 install python-docx python-pptx openpyxl PyPDF2`

## Development

### Run in Development Mode

1. Start the backend server:
```bash
pnpm dev
```

2. In another terminal, start Electron:
```bash
pnpm electron:dev
```

The app will open with the backend running on localhost:3000.

## Building for Production

### Build Windows Installer

```bash
pnpm electron:build:win
```

This will:
1. Build the frontend (Vite)
2. Build the backend (esbuild)
3. Package everything into a Windows installer
4. Output to `release/` directory

The installer will be named something like `Sorto Setup 1.0.0.exe`.

## Distribution

### What Gets Packaged

- Electron app with embedded browser
- Express backend server (runs locally)
- SQLite database (created on first run)
- Python document processor scripts
- All dependencies

### User Installation

1. User downloads `Sorto Setup 1.0.0.exe`
2. Runs installer
3. App installs to `C:\Program Files\Sorto\`
4. Desktop shortcut created
5. First run creates local database

### Data Storage

- Database: `%APPDATA%\Sorto\sorto.db`
- Logs: `%APPDATA%\Sorto\logs\`
- Config: `%APPDATA%\Sorto\config.json`

## Environment Variables for Desktop

The desktop app uses a local SQLite database instead of MySQL.

Required environment variables are bundled in the app:
- `DATABASE_URL`: Points to local SQLite file
- `JWT_SECRET`: Auto-generated on first run
- `PORT`: 3000 (localhost only)

## Troubleshooting

### Server Won't Start

Check logs in: `%APPDATA%\Sorto\logs\server.log`

### Python Scripts Fail

Ensure Python 3.11 and required packages are installed system-wide.

### Port 3000 Already in Use

The app will automatically try ports 3001, 3002, etc.
