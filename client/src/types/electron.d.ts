export interface ElectronAPI {
  // Dialog APIs
  openFolderDialog: () => Promise<string | null>;
  
  // File system APIs
  pathExists: (path: string) => Promise<boolean>;
  stat: (path: string) => Promise<{
    size: number;
    isDirectory: boolean;
    isFile: boolean;
    mtime: Date;
    ctime: Date;
  }>;
  readdir: (path: string) => Promise<Array<{
    name: string;
    isDirectory: boolean;
    isFile: boolean;
  }>>;
  
  // App APIs
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<{
    platform: string;
    arch: string;
    version: string;
  }>;
  
  // Check if running in Electron
  isElectron: boolean;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
