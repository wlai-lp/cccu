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
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1Hd2Z0SlpHNnB1NnRmS1pPRlI2ZSJ9.eyJpc3MiOiJodHRwczovL2Rldi1lYnNmNGZjNy51cy5hdXRoMC5jb20vIiwic3ViIjoibzFvb1ljU2RpMjVvYVhRRFpqWVdkbTBwTmpZZnc3UTBAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vcXVpY2tzdGFydC9hcGkiLCJpYXQiOjE2NjY1NTc0MjEsImV4cCI6MTY2NjY0MzgyMSwiYXpwIjoibzFvb1ljU2RpMjVvYVhRRFpqWVdkbTBwTmpZZnc3UTAiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.AzWcp7o0k4D6ignk5Y5Vz76CnyYsftcY29PqRNiN6JiyUiX8VsX7Z7OAgGzmRuZWNrmQrmGi3xir79bgHpPVVf_YFyN5dldcEe9THj4qSW_TZ28hbUQxb0PZD4-DoABYkMK05lJOqZmW-0jsfW5p1z84BPipp518KD3jx8cVYDQuLRfZsYt2OseSG4-qGphgjwSlCLHjzicDfcYiiykmqYclsIiZq92H00e9yhakuUI6aIHiIOEbGuc7vOohXk76aAxIVeBMk-zHhIj0ycReUiNNIpD1B-RZGeJDou5H4XKXSFIkI7XFRJoXNd38JhuyMZcrDp3Iv9ZTpej5yueF9w"; // paste your JWT in here
    if (token) {
        console.log("got token! " + token);
        console.log("calling callback with token...");
        callback(token);
    }
};