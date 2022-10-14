var endFlag = false;
var timeoutIndex;
// in milliseconds, 1 second = 1000
var minuteTimeout = 6000;
var fiftenMinutesTimeout = 10000;
var bufferTimeout = 2000;

function closeWindow() {
  console.log("close window");
  if ($(".lpc_maximized-header__close-button").length > 0) {
    $(".lpc_maximized-header__close-button").click();
  }
}

function closeSi() {
  console.log("close si");
  if ($(".lpc_confirmation-dialog__confirm-button").length > 0) {
    $(".lpc_confirmation-dialog__confirm-button").click();
  }
}

function closeSequence() {
  console.log("timeout index win " + timeoutIndex);
  // close window by x button
  closeWindow();
  // delay close si
  setTimeout(closeSi, bufferTimeout);
  // delay close window again
  setTimeout(closeWindow, bufferTimeout * 2);
}

function autoClose(data, eventInfo) {
  // if conversation ended in any way, agent close, customer close, autoclose
  if (data.state == "ended") {
    endFlag = true;
    console.log("settimeout to close window");
    // give user a minute before closes UI elements
    timeoutIndex = setTimeout(closeSequence, minuteTimeout);
    console.log("timeout index is " + timeoutIndex);
  } else {
    if (!endFlag) {
      // any other action then reset timer and start a new one to autoclose window
      console.log("clear previous timeout " + timeoutIndex);
      clearTimeout(timeoutIndex);
      timeoutIndex = setTimeout(closeSequence, fiftenMinutesTimeout);
      console.log("new timeout index " + timeoutIndex);
    }
  }
}
lpTag.events.bind("lpUnifiedWindow", "state", autoClose);
