var endFlag = false;
var timeoutIndex;
var endTimeoutIndex;
// in milliseconds, 1 second = 1000, 1 min = 1sec * 60, 15 min = 1 min * 15
var secondTimeout = 1000;
var minuteTimeout = secondTimeout * 60;
var fiftenMinutesTimeout = minuteTimeout * 15;
var bufferTimeout = secondTimeout * 2;
var debug = true;

function tuLog(s) {
  if (debug) {
    console.log(new Date().toString() + " : " + s);
  }
}

function closeWindow() {
  tuLog("close window");
  if ($(".lpc_maximized-header__close-button").length > 0) {
    $(".lpc_maximized-header__close-button").click();
  }
}

function closeSi() {
  tuLog("close si");
  if ($(".lpc_confirmation-dialog__confirm-button").length > 0) {
    $(".lpc_confirmation-dialog__confirm-button").click();
  }
}

function closeSequence() {
  tuLog("timeout index win " + timeoutIndex);
  // close window by x button
  closeWindow();
  // delay close si
  setTimeout(closeSi, bufferTimeout);
  // delay close window again
  setTimeout(closeWindow, bufferTimeout * 2);
}

function autoClose(data, eventInfo) {
  // if conversation ended in any way, agent close, customer close, autoclose
  tuLog(JSON.stringify(data));
  tuLog(JSON.stringify(eventInfo));
  if (data.state == "ended") {
    endFlag = true;
    tuLog("received end event, 1 minute to close window");
    // give user a minute before closes UI elements, we do not want to reset this
    endTimeoutIndex = setTimeout(closeSequence, minuteTimeout);
    tuLog("timeout index is " + endTimeoutIndex);
  } else {
    if (!endFlag) {
      // any other action then reset timer and start a new one to autoclose window
      // NOTE: this is not going to work becuase automessages would reset these timers
      // if we want to do this, we will have to capture last user input instead
      tuLog("clear previous timeout " + timeoutIndex);
      clearTimeout(timeoutIndex);
      timeoutIndex = setTimeout(closeSequence, fiftenMinutesTimeout);
      tuLog("new timeout index " + timeoutIndex);
    }
  }
}
lpTag.events.bind("lpUnifiedWindow", "state", autoClose);
