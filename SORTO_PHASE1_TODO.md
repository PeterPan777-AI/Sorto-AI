# Sorto - Phase 1 Development TODO

## Branding & Setup
- [ ] Update app name from "Document Organizer" to "Sorto"
- [ ] Update all UI text and references
- [ ] Create simple logo/icon
- [ ] Set up i18n architecture (English only for now)

## Core Desktop App Features
- [ ] Simplify database schema for Phase 1
- [ ] Document scanning (PDF, Word, Excel, PowerPoint)
- [ ] Basic AI tagging
- [ ] Duplicate detection
- [ ] Search functionality
- [ ] Simple, clean UI (as designed)
- [ ] License key validation (basic)
- [ ] 7-day trial system

## Landing Page
- [ ] Hero section with tagline
- [ ] Features showcase
- [ ] How it works (3 steps)
- [ ] Pricing section
- [ ] Download/trial CTA
- [ ] FAQ section
- [ ] Responsive design

## Testing & Delivery
- [ ] Test document scanning
- [ ] Test AI tagging accuracy
- [ ] Test search
- [ ] Create deployment guide
- [ ] Deliver to user for feedback

## Deferred to Phase 2
- Smart Reorganize feature
- Advanced export options
- Auto-updates
- Windows installer
- Advanced reporting
- Backup features


## Current Progress
- [x] Update app name to "Sorto"
- [x] Update branding and logo
- [x] Fix Home page UI
- [x] Simple, clean interface working
- [x] Build landing page

## Landing Page Improvements
- [x] Remove all "Ecconiq" references
- [x] Add real app screenshots to landing page
- [x] Expand FAQ section with more questions (now 15 FAQs total)


## Core Functionality Implementation
- [x] Document scanning - browse and scan local folders
- [x] File processing - extract text from Word/Excel/PowerPoint/PDF
- [x] AI tagging service - analyze content and auto-tag documents
- [x] Duplicate detection - find exact and similar files
- [x] Search functionality - full-text search across documents
- [x] Wire up UI to backend services
- [ ] Test with real Turtle House documents

## Desktop App Packaging (Electron)
- [x] Install Electron and electron-builder dependencies
- [x] Create Electron main process file
- [x] Add native file browser dialog
- [x] Set up IPC communication between Electron and web app
- [x] Configure electron-builder for Windows
- [ ] Create Windows installer (.exe)
- [ ] Test desktop app functionality

## Embedded Server Integration
- [x] Create server launcher script for Electron
- [x] Bundle Express server with electron-builder
- [x] Add server startup/shutdown in Electron main process
- [x] Configure port management and error handling
- [ ] Test embedded server in desktop app

## SQLite Migration
- [ ] Install better-sqlite3 package
- [ ] Update Drizzle config for SQLite
- [ ] Update database connection in db.ts
- [ ] Test database operations with SQLite
- [ ] Update environment configuration for local DB

## Windows Installer Build
- [ ] Create app icons (icon.ico, icon.png)
- [ ] Run production build
- [ ] Generate Windows installer
- [ ] Test installer on Windows
