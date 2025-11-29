const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

let mainWindow;
let serverProcess = null;
const SERVER_PORT = 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../client/public/icon.png'),
    title: 'Sorto - Document Organizer'
  });

  // In development, load from Vite dev server
  // In production, load from built files
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/client/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Start the Express server
  await startServer();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

/**
 * Start the Express server
 */
function startServer() {
  return new Promise((resolve, reject) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // In development, assume server is already running
      console.log('Development mode: Using existing server at localhost:3000');
      resolve();
      return;
    }

    // In production, start the bundled server
    const serverPath = path.join(process.resourcesPath, 'app', 'dist', 'index.js');
    
    console.log('Starting server from:', serverPath);
    
    serverProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: SERVER_PORT.toString()
      },
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('running on')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      serverProcess = null;
    });

    // Timeout if server doesn't start in 10 seconds
    setTimeout(() => {
      if (serverProcess) {
        resolve(); // Proceed anyway
      }
    }, 10000);
  });
}

/**
 * Stop the Express server
 */
function stopServer() {
  if (serverProcess) {
    console.log('Stopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// IPC Handlers

/**
 * Open folder picker dialog
 */
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePaths[0];
});

/**
 * Check if a path exists
 */
ipcMain.handle('fs:pathExists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

/**
 * Get file stats
 */
ipcMain.handle('fs:stat', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      mtime: stats.mtime,
      ctime: stats.ctime
    };
  } catch (error) {
    throw new Error(`Failed to stat file: ${error.message}`);
  }
});

/**
 * Read directory contents
 */
ipcMain.handle('fs:readdir', async (event, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile()
    }));
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
});

/**
 * Get app version
 */
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

/**
 * Get platform info
 */
ipcMain.handle('app:getPlatform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version
  };
});
