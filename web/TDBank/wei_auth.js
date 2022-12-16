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
window.lpGetJWT = function (callback) {
  console.log("inside lpGetJWT!");
  /**
     * if token expires, use this curl command to get a new one, run it in terminal
     * curl --request POST \
  --url https://dev-ebsf4fc7.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"o1ooYcSdi25oaXQDZjYWdm0pNjYfw7Q0","client_secret":"sXxwFmKgG94ChJCEYvqXg34pDSUs10GFLlHLUUlo3H4jPcnO8q4QlUI25qMaGKop","audience":"https://quickstart/api","grant_type":"client_credentials"}'
     reference : https://manage.auth0.com/dashboard/us/dev-ebsf4fc7/apis/6355a59afcaa66cce5c0c8ed/test
     */
  const token = "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.RY9uh5pzcZQcd16vu6vWhRk_cY8QZCBk0CMEsJbnuE5Q9k2ImN81O9nbpx75yMsS-Yc498jWfSkf5dPKlgousYzwzwRAVvXvNe-xh7vBalEzkWncohWum_dlxcgCfQBsNpwlEWOj7LoRkj7r9mOg78YVWODfPyRFc3Bc5h49veQ.BRoM-8A3IZPo8vsS.XrpQaWZCVHZh5uFAtLecZbr-nCqLD6Y3mSZcbSumtTIDr5zYcf3g-C0zuQC7nkaHiZELXozXHODzf76vjSATAQaRMxr6CfryoMR0EdevRdC5nSRC4rMAE_L4vdvEj9OOlhxOKQOkluVszg38hqxSI3ZSdQlRHRWF_icEKPy3Xi7UF15ex9aMyy6H4EhsgF15r2rOkEzj4oGLI5NrfJTBr5NKJAJdS1NDNoG55U7feQoUagki3w5UvHQ39IntVMOtJlQh5aZpwR_Gz3eXUj-Q2WJiNNpcKpkjhuqGHhSMHM8KBTcp7yNZvTpDEXtI0m0EfMxfrEZU-v4IiLrl4upnCCQQJAmiv9-E3znfSqcKf1uDWPXarJOc2wD0AGfPqyieiC8gUXaCtvx_Lluqv3-O5FZv48nfYuGYg1VnzITn_7PLG1_87DNFnMBGHONzDjlh1-VbgPzHX5YYlVTsmvAPgN_9WODX4lW-fJpwhvzADJeDo8yRePUpJds9j6mz_yslduC9KLWHiCd6TbdaDwWW5ZfLBa8X-bz4qPjxmqaJxfVilSz5T4zWKeOm64A_8ZKMGcplQ08RlEGkpBJyPvcBmpUpbP59NQaRkSm-U-ghlmy2Fa3iJOHYg2pfDEUg4iWpZlL7cI-luLEQhzP6laeOnVHGdmuHtIJGYr-Pp6iRNhl8MyoyH5Rf9RTFyAfpiQ_p6gseHR8k74Yq64fjlma0naqyAVoh9Z_-rc-_F7-_eEgihMwkUrGG5H0qrEJNh4gtAWVIswfdmyCPfE8zjc6TjXu1OuDL-JPUhcPr.OGih0V0fAmQJvzYQ4m9cJg"; // paste your JWT in here
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
