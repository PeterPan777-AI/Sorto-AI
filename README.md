# Sorto - AI-Powered Document Organizer

![Sorto Logo](build/icon.png)

**Your Documents, Sorted.** Sorto is a privacy-first desktop application that uses AI to automatically organize, tag, and find duplicates in your document library.

## ✨ Features

- **🤖 AI-Powered Tagging** - Automatically categorizes documents by type, topic, and content
- **🔍 Smart Search** - Full-text search across all your documents
- **📑 Duplicate Detection** - Finds exact copies, versions, and similar documents
- **🔒 Privacy First** - All processing happens locally on your computer
- **⚡ Fast & Efficient** - Scans thousands of documents in minutes
- **📊 Organized View** - Dashboard with statistics and quick actions

## 🚀 Download

### Latest Release
Download the latest Windows installer from the [Releases](https://github.com/YOUR_USERNAME/sorto/releases) page.

### System Requirements
- Windows 10 or 11 (64-bit)
- 4GB RAM minimum
- 500MB free disk space
- Python 3.11 (included in installer)

## 📦 Installation

1. Download `Sorto Setup 1.0.0.exe`
2. Double-click to install
3. Launch Sorto from Start Menu
4. Click "Scan Folder" and select your documents folder
5. Watch as Sorto organizes everything!

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm
- Python 3.11
- Git

### Setup
```bash
git clone https://github.com/YOUR_USERNAME/sorto.git
cd sorto
pnpm install
pip install python-docx python-pptx openpyxl PyPDF2
```

### Run Development Server
```bash
pnpm dev
```

### Build for Windows
```bash
pnpm electron:build:win
```

See [BUILD_WINDOWS.md](BUILD_WINDOWS.md) for detailed build instructions.

## 🏗️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Express, tRPC, Drizzle ORM
- **Desktop**: Electron
- **Database**: SQLite (better-sqlite3)
- **AI**: OpenAI-compatible LLM API
- **Document Processing**: Python (python-docx, python-pptx, openpyxl, PyPDF2)

## 📝 License

Copyright © 2024 Sorto. All rights reserved.

## 🤝 Support

- **Website**: [sorto.example.com](https://sorto.example.com)
- **Email**: support@sorto.example.com
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/sorto/issues)

## 🎯 Roadmap

- [ ] Mac and Linux support
- [ ] Cloud sync (optional)
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] Browser extension
- [ ] Integration with cloud storage (Dropbox, Google Drive)

## 🙏 Acknowledgments

Built with love using:
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

Made with ❤️ by the Sorto team
