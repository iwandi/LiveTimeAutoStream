const { obs } = require('./obs.js');
const { storeGet } = require('./store');
const { isValidString } = require('./utils.js');

const { ipcRenderer } = require('electron');

function startCountDown(nextState, delay) {
  window.postMessage({ type: 'startCountDown', nextState: nextState, seconds : delay });
}

function stopCountDown() { 
  window.postMessage({ type: 'stopCountDown' });
}

function lastSceneSet(sceneName) {
  window.postMessage({ type: 'lastSceneSet', sceneName: sceneName });
}

let autoChangeSceneTimer = null;

async function handleStateChange(state) {
  if(!await storeGet('obsToggle', false)) {
    console.log('OBS toggle is off, not applying scene.');
    return;
  }

  var applyScene = false;
  var targetScene = '';
  var nextState = '';
  var targetMaxTime = 0;

  if(isValidString(state)) {
    switch(state){
      case "staging" :
        if(await storeGet('stagingToggle', false)) {
          applyScene = true;
          targetScene = await storeGet('stagingScene', '');
          targetMaxTime = await storeGet('stagingMaxTime', 1);
          nextState = 'running';
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
          nextState = 'staging';
        }
        break;
    }
  }

  if(applyScene){
    if(autoChangeSceneTimer) {
      console.log('Clearing previous timer');
      clearTimeout(autoChangeSceneTimer);
      stopCountDown();
      autoChangeSceneTimer = null;
    }

    console.log('Applying scene:', targetScene);
    obs.call('SetCurrentProgramScene', {
      sceneName: targetScene
    });
    lastSceneSet(targetScene);
  }

  if(targetMaxTime > 0 && isValidString(nextState)) {
    console.log('Setup Auto Change State Next State:', nextState, targetMaxTime);
    autoChangeSceneTimer = setTimeout(async () => {
      console.log('Applying Next State:', nextState);
      autoChangeSceneTimer = null;
      await handleStateChange(nextState);
    }, targetMaxTime * 1000);
    startCountDown(nextState, targetMaxTime);
  }
}

ipcRenderer.on('liveTimeDataProcess', async (event, message) => {
    if(message.type == 'raceData') {
      console.log('raceData');
      state = message.data.split('|')[2];
      console.log('State:', state);
      await handleStateChange(state);
    }
  });

module.exports = {
    handleStateChange,
};