# Setting Up GitHub for Automatic Windows Builds

This guide will help you set up GitHub to automatically build Windows installers for Sorto every time you push code.

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Fill in:
   - **Repository name**: `sorto`
   - **Description**: "AI-Powered Document Organizer"
   - **Visibility**: Private (or Public if you want to open-source it)
4. **DO NOT** initialize with README (we already have one)
5. Click **Create repository**

## Step 2: Push Your Code to GitHub

Open PowerShell in your `doc_organizer` folder and run:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Sorto v1.0.0"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sorto.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see the "Build Windows Installer" workflow
4. It will automatically run on the first push!

## Step 4: Download Your Installer

After the workflow completes (takes about 10-15 minutes):

### Option A: Download from Actions
1. Go to **Actions** tab
2. Click on the latest workflow run
3. Scroll down to **Artifacts**
4. Download `sorto-windows-installer.zip`
5. Extract and you'll find `Sorto Setup 1.0.0.exe`

### Option B: Create a Release (Recommended)
1. Go to **Releases** → **Create a new release**
2. Click **Choose a tag** → Type `v1.0.0` → **Create new tag**
3. Fill in:
   - **Release title**: `Sorto v1.0.0`
   - **Description**: Release notes (what's new, bug fixes, etc.)
4. Click **Publish release**
5. GitHub Actions will automatically build and attach the installer!

## Step 5: Future Updates

Every time you make changes:

```powershell
# Make your changes to the code
# Then commit and push:
git add .
git commit -m "Add new feature"
git push
```

GitHub will automatically build a new installer! Download it from the Actions tab.

## Creating New Releases

When you're ready to release a new version:

```powershell
# Update version in package.json first
# Then create and push a tag:
git tag v1.1.0
git push origin v1.1.0
```

GitHub will automatically:
- Build the Windows installer
- Create a GitHub Release
- Attach the installer to the release

Users can then download it from the Releases page!

## Troubleshooting

### Build Fails
- Check the Actions tab for error logs
- Common issues:
  - Missing dependencies (check package.json)
  - Python package errors (check workflow file)
  - Electron build errors (check electron/main.js)

### Can't Push to GitHub
- Make sure you've set up Git credentials:
  ```powershell
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```
- If using HTTPS, you may need a Personal Access Token:
  1. GitHub → Settings → Developer settings → Personal access tokens
  2. Generate new token (classic)
  3. Select `repo` scope
  4. Use the token as your password when pushing

### Workflow Doesn't Run
- Make sure the workflow file is in `.github/workflows/build-windows.yml`
- Check that Actions are enabled in repository settings
- Try pushing a new commit to trigger it

## Next Steps

Once GitHub Actions is working:

1. **Set up automatic updates** - Users get notified of new versions
2. **Add code signing** - Remove Windows Defender warnings
3. **Set up CI/CD** - Automate testing before building
4. **Add changelog** - Auto-generate release notes

## Tips

- **Keep your repository private** if you're selling Sorto
- **Use semantic versioning**: v1.0.0, v1.1.0, v2.0.0
- **Write good commit messages** so you know what changed
- **Tag releases** so users can download specific versions
- **Add a CHANGELOG.md** to track what's new in each version

---

Need help? Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or open an issue!
