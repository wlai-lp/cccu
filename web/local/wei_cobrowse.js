// function enterServiceNumber() {
//   console.log("enter cobrowse");
// }

/**
 * Requests a CoBrowse session using an agent's service id. This can be used in phone-only scenarios when CoBrowse cannot be started via chat.
 *
 * Example Usage: requestCobrowse("123456");
 * @param serviceId
 */
function requestCobrowse(serviceId) {
  lpTag.taglets.cobrowse.loadApi(function (visitorApi) {
    console.log("CoBrowse visitor API loaded");
    visitorApi.once("sessionRejected", function () {
      alert("The service number is invalid.");
    });

    visitorApi.once("sessionOffered", function (event) {
      console.log("Agent answered the request and offers a CoBrowse session");
      var automaticallyAcceptOffer = true; // Set to false if you would like to ask the visitor to confirm the session start.

      if (
        automaticallyAcceptOffer ||
        confirm(
          "Would you like to start a CoBrowse session with '" +
            event.agentAlias +
            "'?"
        )
      ) {
        visitorApi.acceptSupportOffer(event);
      } else {
        visitorApi.cancelSupportOffer(event);
      }
    });

    function sessionReadyCallback(startEvent) {
      if (startEvent) {
        console.log("Session is ready and will be started shortly.");
      }
    }

    visitorApi.requestSupport({ serviceId: serviceId }, sessionReadyCallback);
  });
}

/**
 * Example: Display a simple dialog for entering the service number.
 */

function enterServiceNumber() {
  console.log("enter cobrowse");
  var serviceId = prompt(
    "Please enter the CoBrowse service number in the field below."
  );
  if (serviceId) {
    requestCobrowse(serviceId);
  }
}
