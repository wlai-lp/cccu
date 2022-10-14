function autoClose(data, eventInfo) {
  // if conversation ended in any way, agent close, customer close, autoclose
  if (data.state == "ended") {
    // give user a minute before closes UI elements
    setTimeout(() => {
      if ($(".lpc_maximized-header__close-button").length > 0) {
        $(".lpc_maximized-header__close-button").click();
      }
    }, "60000");
  }
}
lpTag.events.bind("lpUnifiedWindow", "state", autoClose);
