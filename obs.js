const OBSWebSocket = require('obs-websocket-js').default;
const obs = new OBSWebSocket();

const { storeGet } = require('./store');
const { contextBridge } = require('electron');

let connect = false;
let isConnecting = false;
let isConnected = false;

async function connectToOBS() {
    if (isConnecting || obs.connected || !connect) 
        return;

    isConnecting = true;

    while (!isConnected && connect) {
        try {
            console.log('[OBS] Connecting... Attempt', isConnected, connect);
            const uri = await storeGet('obsUrl', 'ws://localhost:4455');
            const password = await storeGet('obsPassword', '');
            await obs.connect(uri, password);
            isConnected = true;
            console.log('[OBS] Connected');
            // Just wait to not spawm            
            await new Promise(res => setTimeout(res, 5000));
        } catch (error) {
            console.error('[OBS] Connection failed, retrying in 5s...', error);
            await new Promise(res => setTimeout(res, 5000));
        }
    }

    isConnecting = false;
}

async function disconnectOBS() {
    if (obs.connected) {
        await obs.disconnect();
        isConnected = false;
        console.log('[OBS] Disconnected');
    }
}

async function setOBSConnectionState(state) {
    connect = state;

    if (state) {
        connectToOBS();
    } else {
        disconnectOBS();
    }
};

contextBridge.exposeInMainWorld('obsControl', {
    setOBSConnectionState: (state) => setOBSConnectionState(state),
  });

module.exports = {
    obs,
    connectToOBS,
    setOBSConnectionState,
};