const { contextBridge, ipcRenderer } = require('electron');
const path = require("path");
const fs = require("fs");

const { storeGet } = require('./store');

contextBridge.exposeInMainWorld("hookBridge", {
    getInjectedCode: () => {
        const code = fs.readFileSync(path.join(__dirname, "inject-hooks.js"), "utf8");
        return code;
    },
    storeGet:(key, defaultValue) => storeGet(key, defaultValue),
    storeSet:(key, value) => {
        ipcRenderer.invoke('storeSet', key, value);
    }
});