const scoringFrame = document.getElementById('scoringFrame');
const inputEventId = document.getElementById('eventId');
const lastSceneSet = document.getElementById('lastSceneSet');
const obsToggle = document.getElementById('obsToggle');
const obsUri = document.getElementById('obsUri');
const obsPassword = document.getElementById('obsPassword');
const stagingToggle = document.getElementById('stagingToggle');
const stagingScene = document.getElementById('stagingScene');
const stagingMaxTime = document.getElementById('stagingMaxTime');
const runningToggle = document.getElementById('runningToggle');
const runningScene = document.getElementById('runningScene');
const completeToggle = document.getElementById('completeToggle');
const completeScene = document.getElementById('completeScene');
const completeMaxTime = document.getElementById('completeMaxTime');
const countdownNextState = document.getElementById('countdownNextState');
const nextState = document.getElementById('nextState');

function getToggleButton(button) {
  return button.innerHTML == 'Enabled' ? true : false
}

function setToggleButton(button, state) {  
  button.classList.toggle('toggleEnabled', state);
  button.classList.toggle('toggleDisabled', !state);
  button.innerHTML = state ? 'Enabled' : 'Disabled';
}

function toggleButton(button){
  setToggleButton(button, !getToggleButton(button));
}

function saveConfig(){
  window.hookBridge.storeSet('eventId', inputEventId.value.trim());
  window.hookBridge.storeSet('obsToggle', getToggleButton(obsToggle));
  window.hookBridge.storeSet('obsUri', obsUri.value.trim());
  window.hookBridge.storeSet('obsPassword', obsPassword.value.trim());
  window.hookBridge.storeSet('stagingToggle', getToggleButton(stagingToggle));
  window.hookBridge.storeSet('stagingScene', stagingScene.value.trim());
  window.hookBridge.storeSet('stagingMaxTime', stagingMaxTime.value.trim());
  window.hookBridge.storeSet('runningToggle', getToggleButton(runningToggle));
  window.hookBridge.storeSet('runningScene', runningScene.value.trim());
  window.hookBridge.storeSet('completeToggle', getToggleButton(completeToggle));
  window.hookBridge.storeSet('completeScene', completeScene.value.trim());
  window.hookBridge.storeSet('completeMaxTime', completeMaxTime.value.trim());
}

async function loadConfig() {
  inputEventId.value = await window.hookBridge.storeGet('eventId', '');
  setToggleButton(obsToggle, await window.hookBridge.storeGet('obsToggle', false));
  obsUri.value = await window.hookBridge.storeGet('obsUri', 'ws://localhost:4455');
  obsPassword.value = await window.hookBridge.storeGet('obsPassword', '');
  setToggleButton(stagingToggle, await window.hookBridge.storeGet('stagingToggle', false));
  stagingScene.value = await window.hookBridge.storeGet('stagingScene', 'Pre-Race');
  stagingMaxTime.value = await window.hookBridge.storeGet('stagingMaxTime', '30');
  setToggleButton(runningToggle, await window.hookBridge.storeGet('runningToggle', false));
  runningScene.value = await window.hookBridge.storeGet('runningScene', 'Race');
  setToggleButton(completeToggle, await window.hookBridge.storeGet('completeToggle', false));
  completeScene.value = await window.hookBridge.storeGet('completeScene', 'Post-Race');
  completeMaxTime.value = await window.hookBridge.storeGet('completeMaxTime', '30');
}

async function loadEvent() {  
  await window.obsControl.setOBSConnectionState(true);

  const id = inputEventId.value.trim();
  const url = `https://${id}.livefpv.com/live/scoring/`;

  scoringFrame.src = url;

  saveConfig();
}

function toggleState(state) {
  switch (state) {
    case "obs":
      toggleButton(obsToggle);      
      setOBSConnectionState(state);
      break;
    case "staging":
      toggleButton(stagingToggle);
      break;
    case "running":
      toggleButton(runningToggle);
      break;
    case "complete":
      toggleButton(completeToggle);
      break;      
  }
  saveConfig();
}

let countdownTimer;

function startCountDown(nextStateName, delay) {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  nextState.textContent = nextStateName;
  let remaining = delay;

  function update() {
    const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
    const seconds = (remaining % 60).toString().padStart(2, '0');
    countdownNextState.textContent = `${minutes}:${seconds}`;

    if (remaining <= 0) {
      clearInterval(countdownTimer);
    } else {
      remaining--;
    }
  }
  countdownTimer = setInterval(update, 1000);
}

function stopCountDown() {  
  if(countdownTimer) 
  {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdownNextState.textContent = "00:00";
  nextState.textContent = "---";
}

scoringFrame.addEventListener("dom-ready", () => {
  //scoringFrame.openDevTools();

  loadConfig();
  stopCountDown();

  const hookScript = window.hookBridge.getInjectedCode();
  scoringFrame.executeJavaScript(hookScript).then(() => {
    console.log("Injected hook script");
  });
});

window.addEventListener('message', (event) => {
  if (event.data.type === 'startCountDown') {
    startCountDown(event.data.nextState, event.data.seconds);
  }

  if (event.data.type === 'stopCountDown') {
    stopCountDown();
  }

  if (event.data.type === 'lastSceneSet') {
    lastSceneSet.textContent = event.data.sceneName;
  }
});

console.log("Renderer script executed");