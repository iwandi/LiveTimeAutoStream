const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const Store = require('electron-store').default;
const store = new Store();

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer.html')).then(() => {
    console.log('Window loaded successfully!');
  }).catch((err) => {
    console.error('Error loading window:', err);
  });

  ipcMain.on('liveTimeDataHook', (event, data) => {    
    console.log("Received data from hook:", data);
    win.webContents.send("liveTimeDataProcess", data);
  });

  ipcMain.handle('storeGet', (event, key, defaultValue) => {
    console.log("storeGet:", key, defaultValue);
    const value = store.get(key, defaultValue);
    return value;
  });
  ipcMain.handle('storeSet', (event, key, value) => {
    console.log("storeSet:", key, value);
    store.set(key, value);
    return true;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
