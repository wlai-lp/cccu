/**
 * authentication
 */

 function identityFn(callback) {
    console.log("identity function");
    callback({
        // all three are required
        iss: "https://www.liveperson.com",
        acr: "loa1",
        sub: "920000"
    });
}
lpTag.identities.push(identityFn);

// Authentication JSMethod for LiveEngage
window.lpGetAuthenticationToken = function (callback) {
    console.log("inside lpGetAuthenticationToken!");
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"; // paste your JWT in here
    if (token) {
        console.log("got token! " + token);
        console.log("calling callback with token...");
        callback(token);
    }
};