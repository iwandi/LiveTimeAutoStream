console.log("✅ Preload script loaded");

const { isValidString } = require('./utils');

const { contextBridge, ipcRenderer } = require('electron');
const path = require("path");
const fs = require("fs");
const { get } = require('http');

const OBSWebSocket = require('obs-websocket-js').default;
const obs = new OBSWebSocket();

gConfig = {};

ipcRenderer.on('loadStore', (event, config) => {
  console.log("Received config from main:", config);
  gConfig = config;
});

function storeGet(key, defaultValue) {
  return ipcRenderer.invoke('storeGet', key, defaultValue);
};

contextBridge.exposeInMainWorld("hookBridge", {
    getInjectedCode: () => {
      const code = fs.readFileSync(path.join(__dirname, "inject-hooks.js"), "utf8");
      return code;
    },
    ipcRenderer: ipcRenderer,
    storeGet:(key, defaultValue) => storeGet(key, defaultValue),
    storeSet:(key, value) => {
      ipcRenderer.invoke('storeSet', key, value);
    }
  });

let autoChangeSceneTimer = null;

ipcRenderer.on('liveTimeDataProcess', async (event, message) => {
    if(message.type == 'raceData') {
      console.log('raceData');
      state = message.data.split('|')[2];
      console.log('State:', state);

      if(!await storeGet('obsToggle', false)) {
        console.log('OBS toggle is off, not applying scene.');
        return;
      }

      var applyScene = false;
      var targetScene = '';
      var nextScene = '';
      var targetMaxTime = 0;

      if(isValidString(state)) {
        switch(state){
          case "staging" :
            if(await storeGet('stagingToggle', false)) {
              applyScene = true;
              targetScene = await storeGet('stagingScene', '');
              targetMaxTime = await storeGet('stagingMaxTime', 1);
              nextScene = await storeGet('runningScene', '');
            }
            break;
          case "running" :
            if(await storeGet('runningToggle', false)) {
              applyScene = true;
              targetScene = await storeGet('runningScene', '');
            }
            break;
          case "complete" :
            if(await storeGet('completeToggle', false)) {
              applyScene = true;
              targetScene = await storeGet('completeScene', '');
              targetMaxTime = await storeGet('completeMaxTime', 1);
              nextScene = await storeGet('stagingScene', '');
            }
            break;
        }
      }

      if(applyScene){
        console.log('Applying scene:', targetScene);
        obs.call('SetCurrentProgramScene', {
          sceneName: targetScene
        });
      }

      if(targetMaxTime > 0 && isValidString(nextScene)) {
        autoChangeSceneTimer = setTimeout(() => {
          console.log('Applying Next Scene:', nextScene);
          obs.call('SetCurrentProgramScene', {
            sceneName: nextScene
          });
        }, targetMaxTime * 1000);
      }
    }
  });

  async function connectToOBS() {
    try {
      await obs.connect('ws://localhost:4455', 'QgaojAvE7PI6LZp0');
      console.log('Connected to OBS');
    } catch (error) {
      console.error('Failed to connect to OBS:', error);
    }
  }
  
  connectToOBS();