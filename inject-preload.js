const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("hookBridge", {
    sendLiveTimeData: (data) => ipcRenderer.send('liveTimeDataHook', data)
  });
