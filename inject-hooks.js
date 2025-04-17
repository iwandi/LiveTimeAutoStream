// inject-hooks.js

(function () {
    console.log("[HOOK] hooking liveData...");
    const waitForLiveData = () => {
      if (window.liveData) {
        
        window.liveData.socket.on("updateRaceData", function(c) {
            console.log("[HOOK] updateRaceData:", c);
            window.hookBridge.sendLiveTimeData({
                type: 'raceData',
                data: c
              });
        });
  
        window.liveData.socket.on("updateDriverData", function(c) {
            console.log("[HOOK] updateDriverData:", c);
            window.hookBridge.sendLiveTimeData({
                type: 'driverData',
                data: c
              });
        });
  
        console.log("[HOOK] Hooks installed successfully");
      } else {
        setTimeout(waitForLiveData, 500);
      }
    };
  
    waitForLiveData();
  })();
  