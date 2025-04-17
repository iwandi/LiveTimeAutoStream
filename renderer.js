var scoringFrame = document.getElementById('scoringFrame');
var inputEventId = document.getElementById('eventId');
var obsToggle = document.getElementById('obsToggle');
var stagingToggle = document.getElementById('stagingToggle');
var stagingScene = document.getElementById('stagingScene');
var stagingMaxTime = document.getElementById('stagingMaxTime');
var runningToggle = document.getElementById('runningToggle');
var runningScene = document.getElementById('runningScene');
var completeToggle = document.getElementById('completeToggle');
var completeScene = document.getElementById('completeScene');
var completeMaxTime = document.getElementById('completeMaxTime');

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
  setToggleButton(stagingToggle, await window.hookBridge.storeGet('stagingToggle', false));
  stagingScene.value = await window.hookBridge.storeGet('stagingScene', 'Pre-Race');
  stagingMaxTime.value = await window.hookBridge.storeGet('stagingMaxTime', '1');
  setToggleButton(runningToggle, await window.hookBridge.storeGet('runningToggle', false));
  runningScene.value = await window.hookBridge.storeGet('runningScene', 'Race');
  setToggleButton(completeToggle, await window.hookBridge.storeGet('completeToggle', false));
  completeScene.value = await window.hookBridge.storeGet('completeScene', 'Post-Race');
  completeMaxTime.value = await window.hookBridge.storeGet('completeMaxTime', '1');
}

function loadEvent() {
  const id = inputEventId.value.trim();
  const url = `https://${id}.livefpv.com/live/scoring/`;

  scoringFrame.src = url;

  saveConfig();
}

function toggleState(state) {
  switch (state) {
    case "obs":
      toggleButton(obsToggle);
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

scoringFrame.addEventListener("dom-ready", () => {
  //scoringFrame.openDevTools();

  loadConfig();

  const hookScript = window.hookBridge.getInjectedCode();
  scoringFrame.executeJavaScript(hookScript).then(() => {
    console.log("Injected hook script");
  });
});

console.log("Renderer script executed");