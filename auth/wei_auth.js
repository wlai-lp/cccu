/**
 * authentication
 */

let token = "";

function identityFn(callback) {
  console.log("identity function");
  callback({
    // all three are required
    iss: "https://www.liveperson.com",
    acr: "loa1",
    sub: "920000",
  });
}
lpTag.identities.push(identityFn);

// Authentication JSMethod for LiveEngage
window.lpGetAuthenticationToken = function (callback) {
  console.log("inside lpGetAuthenticationToken!");
  /**
     * if token expires, use this curl command to get a new one, run it in terminal
     * curl --request POST \
  --url https://dev-ebsf4fc7.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"o1ooYcSdi25oaXQDZjYWdm0pNjYfw7Q0","client_secret":"sXxwFmKgG94ChJCEYvqXg34pDSUs10GFLlHLUUlo3H4jPcnO8q4QlUI25qMaGKop","audience":"https://quickstart/api","grant_type":"client_credentials"}'
     reference : https://manage.auth0.com/dashboard/us/dev-ebsf4fc7/apis/6355a59afcaa66cce5c0c8ed/test
     */
//   const token = ""; // paste your JWT in here
  if (token) {
    console.log("got token! " + token);
    console.log("calling callback with token...");
    callback(token);
  }
};

var settings = {
  async: true,
  crossDomain: true,
  url: "https://dev-ebsf4fc7.us.auth0.com/oauth/token",
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  data: '{"client_id":"o1ooYcSdi25oaXQDZjYWdm0pNjYfw7Q0","client_secret":"sXxwFmKgG94ChJCEYvqXg34pDSUs10GFLlHLUUlo3H4jPcnO8q4QlUI25qMaGKop","audience":"https://quickstart/api","grant_type":"client_credentials"}',
};

$.ajax(settings).done(function (response) {
  console.log(response);
  token = response.access_token;
});
