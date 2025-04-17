const { ipcRenderer } = require('electron');

function storeGet(key, defaultValue) {
    return ipcRenderer.invoke('storeGet', key, defaultValue);
};

module.exports = {
    storeGet,
};