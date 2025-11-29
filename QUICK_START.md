# Document Organizer - Quick Start Guide

## For You (Peter) - Testing on Your Laptop

This guide will help you get the Document Organizer running on your Windows laptop so you can test it with your actual documents.

---

## Step 1: Download the Project

You'll need to download the entire project from the sandbox to your computer.

**Option A: Download as ZIP**
1. In the Manus interface, click "Code" in the management panel
2. Click "Download All Files"
3. Extract the ZIP to `C:\DocumentOrganizer`

**Option B: Use Git** (if you have it)
```bash
git clone [repository-url] C:\DocumentOrganizer
```

---

## Step 2: Install Prerequisites

### Install Python 3.11

1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or later
3. **Important**: During installation, check "Add Python to PATH"
4. Complete the installation

Verify installation:
```bash
python --version
```
Should show: `Python 3.11.x`

### Install Node.js 22

1. Go to https://nodejs.org/
2. Download the LTS version (22.x)
3. Run the installer with default settings

Verify installation:
```bash
node --version
```
Should show: `v22.x.x`

### Install pnpm

Open Command Prompt and run:
```bash
npm install -g pnpm
```

Verify installation:
```bash
pnpm --version
```

---

## Step 3: Set Up the Application

Open Command Prompt and navigate to your project folder:

```bash
cd C:\DocumentOrganizer
```

### Install Node.js Dependencies

```bash
pnpm install
```

This will take a few minutes the first time.

### Install Python Dependencies

```bash
pip install python-docx python-pptx openpyxl pillow
```

### Set Up the Database

```bash
pnpm db:push
```

This creates the database schema.

### Build the Frontend

```bash
pnpm run build
```

This compiles the React application.

---

## Step 4: Launch the Application

### Method 1: Using the Batch File (Easiest)

1. Open File Explorer
2. Navigate to `C:\DocumentOrganizer\desktop`
3. Double-click `DocumentOrganizer.bat`
4. A command window will open and the app will start
5. Your browser will automatically open to the application

### Method 2: Using Command Prompt

```bash
cd C:\DocumentOrganizer
python desktop/launcher.py
```

---

## Step 5: First-Time Setup

1. **Sign In**
   - When the browser opens, click "Get Started"
   - Sign in with your Manus account
   - Your 7-day free trial starts automatically

2. **You'll see the dashboard** with:
   - Welcome message with your name
   - Trial status (7 days remaining)
   - Stats cards (all showing 0 initially)
   - Quick action buttons

---

## Step 6: Scan Your Documents

Now let's scan your actual documents!

1. **Click "Browse Documents"** in the sidebar (or the Quick Actions card)

2. **Enter your folder path** in the scan box:
   ```
   D:\A Turtle House MAin Stuff\AAA FILES AI\AAA SINTRA
   ```

3. **Click "Scan Folder"**

4. **Wait for processing**:
   - The system will scan all subfolders recursively
   - Extract text from Word (.docx), PowerPoint (.pptx), and Excel (.xlsx) files
   - Use AI to analyze and tag each document
   - Detect duplicates and similar versions
   - This may take 5-10 minutes for ~250 documents

5. **Watch the progress**:
   - You'll see a loading indicator
   - When complete, you'll see a success message
   - The documents list will populate

---

## Step 7: Explore Your Documents

### Browse Documents

- Scroll through the list of all your documents
- Each document shows:
  - File name and path
  - Document type (automatically detected)
  - Categories and tags (AI-generated)
  - File size and modification date

### Search

- Use the search bar to find documents by:
  - File name
  - Content (full-text search)
  - Any text within the document

### View Duplicates

1. Click "Review Duplicates" in the sidebar
2. See groups of similar or duplicate documents
3. Each group shows similarity percentages
4. Mark groups as "Resolved" when you've reviewed them

### Check Settings

1. Click "Settings" in the sidebar
2. View your trial status
3. See account information
4. (Later) Enter a license key to activate

---

## Troubleshooting

### "Port 3000 is already in use"

Another application is using port 3000. Either:
- Close that application
- Or the launcher will automatically find another port

### "Python is not installed or not in PATH"

- Reinstall Python and make sure to check "Add Python to PATH"
- Or manually add Python to your PATH environment variable

### "Node.js is not installed"

- Install Node.js from nodejs.org
- Restart Command Prompt after installation

### Scan fails or hangs

- Make sure you have read permissions for the folder
- Try a smaller folder first to test
- Check that files are not locked by other programs

### Browser doesn't open automatically

- Manually open your browser
- Go to: `http://localhost:3000`
- Bookmark this URL for future use

---

## What Happens Next?

After testing with your documents:

1. **Evaluate the results**:
   - Are the AI tags accurate?
   - Are duplicates detected correctly?
   - Is the search working well?

2. **Provide feedback**:
   - What works well?
   - What needs improvement?
   - What features are missing?

3. **Prepare for distribution**:
   - Add your branding
   - Set up payment processing
   - Create professional installer
   - Write marketing materials

---

## Daily Usage

Once set up, using the app is simple:

1. **Double-click** `DocumentOrganizer.bat` (or create a desktop shortcut)
2. **Browser opens** automatically
3. **Start working** with your documents

To stop the application:
- Close the command window
- Or press Ctrl+C in the command window

---

## Data Location

All your data is stored locally:

- **Database**: `%APPDATA%\DocumentOrganizer\database.db`
- **Your original documents**: Never moved or modified

---

## Need Help?

If you run into issues:

1. Check the `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Check the `desktop/README.md` for troubleshooting
3. Review the error messages in the command window
4. Let me know what's not working!

---

## Next Steps After Testing

Once you're happy with the application:

1. **Refine the AI tagging** based on your document types
2. **Add payment integration** (Stripe/PayPal)
3. **Create a professional installer** (using Inno Setup or similar)
4. **Add your branding** (logo, company name, colors)
5. **Write marketing copy**
6. **Launch and sell!**

---

**You're all set!** 🎉

Start by following Steps 1-6 above, and you'll have the application running on your laptop, scanning your actual documents.

Good luck, and let me know how it goes!
