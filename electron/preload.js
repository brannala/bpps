// Preload script for Electron
// This script runs in the renderer process but has access to Node.js APIs
// It provides a secure bridge between the renderer and main processes

const { contextBridge } = require('electron');

// Expose a minimal API to the renderer process
// For now, this is empty since we're just wrapping the web app
// In the future, you could add native file dialog access here

contextBridge.exposeInMainWorld('electronAPI', {
    // Platform info
    platform: process.platform,
    isElectron: true,

    // Version info
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});

// Log that we're running in Electron
console.log('Running in Electron environment');
