const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose safe APIs to the renderer process
 */
contextBridge.exposeInMainWorld('electron', {
  // Dialog APIs
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  
  // File system APIs
  pathExists: (path) => ipcRenderer.invoke('fs:pathExists', path),
  stat: (path) => ipcRenderer.invoke('fs:stat', path),
  readdir: (path) => ipcRenderer.invoke('fs:readdir', path),
  
  // App APIs
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  
  // Check if running in Electron
  isElectron: true
});
