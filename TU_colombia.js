var endFlag = false;
var timeoutIndex;
var minuteTimeout = "6000";

function closeWindow() {
  console.log("close window");
  if ($(".lpc_maximized-header__close-button").length > 0) {
    $(".lpc_maximized-header__close-button").click();
  }
}

function autoClose(data, eventInfo) {
  // if conversation ended in any way, agent close, customer close, autoclose
  if (data.state == "ended") {
    endFlag = true;
    console.log("settimeout to close window");
    // give user a minute before closes UI elements
    setTimeout(closeWindow, minuteTimeout);
  } else {
    if (!endFlag) {
      // any other action then reset timer and start a new one to autoclose window
    }
  }
}
lpTag.events.bind("lpUnifiedWindow", "state", autoClose);
