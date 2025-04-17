const OBSWebSocket = require('obs-websocket-js').default;
const obs = new OBSWebSocket();

const { storeGet } = require('./store');

async function connectToOBS() {
    try {
        let uri = await storeGet('obsUrl', 'ws://localhost:4455');
        let password = await storeGet('obsPassword', '');
        await obs.connect(uri, password);
        console.log('Connected to OBS');
    } catch (error) {
        console.error('Failed to connect to OBS:', error);
    }
}

module.exports = {
    obs,
    connectToOBS,
};