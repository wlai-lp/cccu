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
    /**
     * if token expires, use this curl command to get a new one, run it in terminal
     * curl --request POST \
  --url https://dev-ebsf4fc7.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"o1ooYcSdi25oaXQDZjYWdm0pNjYfw7Q0","client_secret":"sXxwFmKgG94ChJCEYvqXg34pDSUs10GFLlHLUUlo3H4jPcnO8q4QlUI25qMaGKop","audience":"https://quickstart/api","grant_type":"client_credentials"}'
     reference : https://manage.auth0.com/dashboard/us/dev-ebsf4fc7/apis/6355a59afcaa66cce5c0c8ed/test
     */
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1Hd2Z0SlpHNnB1NnRmS1pPRlI2ZSJ9.eyJpc3MiOiJodHRwczovL2Rldi1lYnNmNGZjNy51cy5hdXRoMC5jb20vIiwic3ViIjoibzFvb1ljU2RpMjVvYVhRRFpqWVdkbTBwTmpZZnc3UTBAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vcXVpY2tzdGFydC9hcGkiLCJpYXQiOjE2NjczNTQzNjcsImV4cCI6MTY2NzQ0MDc2NywiYXpwIjoibzFvb1ljU2RpMjVvYVhRRFpqWVdkbTBwTmpZZnc3UTAiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.c8itHgMjZcPXwPc6KFbnxCkpy8_FU1eErFheqQbNocwULR00XK0waHZx5G-oKTu8gAcG_nRnDExaWh-K9jYPBHl77KbYHbeJpumDAZjX_ylBsFZc_tpl4n_1pLn-NI2qSuXbVbxlJ1Z5ckd1MDrqZcogyQPzyn3PwJnchB9vub0Vxsv-Q0ac82L1F733GhkmgD0U4eJiLbV2W045UdIJRsMS3cNX-AFCgxUbpCMzbZ0mWuwUByGipC8Uqh8aEwi_AT9AkxLVX_uj8aU8Zdb0egpT5VBcXUbqjmbEA6_95x8RTpPcWgzSLPY2-mTPRWjOyQFsXZiTdRNDmXmOoKTeFA"; // paste your JWT in here
    if (token) {
        console.log("got token! " + token);
        console.log("calling callback with token...");
        callback(token);
    }
};