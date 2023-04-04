const {
	Toolbelt,
	LpServices
} = require("lp-faas-toolbelt");
const httpClient = Toolbelt.HTTPClient();
const lpClient = Toolbelt.LpClient();
// Obtain a secretClient instance from the Toolbelt to access your saved Conversation Orchestrator key
const secretClient = Toolbelt.SecretClient();
var secretCache = {};

async function lazyLoadSecret(name, callback) {

  // this is how you can access your stored secret
  await secretClient.readSecret('mavenApiKey')
  .then(mkey => {
    // Fetching the secret value
    const value = mkey.value
    secretCache = value;
    console.info("secret: " + secretCache);
    updateConversationContextServiceRaw(queueHealthResponse, mavenApiKey);
    callback(null, { message: 'Successfully updated secret', pword: value });
  })
  .catch(err => {
    console.error(`Failed during secret operation with ${err.message}`)
    callback(err, null);
  });
  
}


function lambda(input, callback) {
    // Variables to access Current Queue Health API
    const accountId = '88417709'; //complete w/ site id
    const lpServiceName = 'leDataReporting';
    const apiEndpoint = `/operations/api/account/${accountId}/msgqueuehealth/current/?v=1`;
    const apiOptions = {
      method: 'GET',
      json: true
    }
    // Variables for Conversation Context Service
    const namespace = 'EscalationBot'; // name of the namespace
    const sessionId = '' || undefined; // optional: if not provided will use default session
    console.debug("namespace: " + namespace);
    //console.warn("namespace: " + namespace);
    // Retrieve mavenApiKey from secret storage
    async function fetchSecret() {
      try {
        const secret = await secretClient.readSecret('mavenApiKey');
        return secret.value;
      } catch(err) {
        console.error('Could not retrieve api key from secret storage');
      }
    }

    // Update conversation context service with results from the current queue health call
    async function updateConversationContextServiceRaw(queueHealthResponse, mavenApiKey) {
  
      //console.info("updateConversationContextService queueHealthResponse: " + JSON.stringify(queueHealthResponse));
      try {
  
        CCSUrl = `https://z1.context.liveperson.net/v1/account/${process.env.BRAND_ID}/${process.env.CONTEXT_NAMESPACE_NAME}/properties`;
  
        const updateCS =  await httpClient(CCSUrl, {
            method: "PATCH",
            headers: {
              'maven-api-key': mavenApiKey,
              'Content-Type': 'application/json',
            },
            simple: true,
            body: queueHealthResponse,
            json: true,
          });
          
          console.info(`Successfully updated Context Service`);
          callback(null, `Successfully updated Context Service`);
          
        } catch(err) {
          console.error("err: " + err);
          console.error("err: " + JSON.stringify(err));
          console.error('Could not update properties in the context service');
        }
    }
    
    // Update conversation context service with results from the current queue health call
    async function updateConversationContextService(keyValuePair, secret) {
      const contextClient = Toolbelt.ContextServiceClient({ apiKey: secret, accountId: accountId });
      try {
        const sessionProperties = await contextClient.updatePropertiesInNamespace(namespace, keyValuePair, sessionId);
        //console.info(JSON.stringify(sessionProperties));
        callback(null, `Successfully updated Context Service`);
      } catch(err) {
        console.error('Could not update properties in the context service');
      }
    }
    // Call the Current Queue Health API, retrive the api key from secret storage, and update Conversation Context Service.
    async function main() {
      const mavenApiKeySecret = await secretClient.readSecret('mavenApiKey');
      const mavenApiKey = mavenApiKeySecret.value;
      //console.info("mavenApiKey: " + mavenApiKey);
      const queueHealthResponse = await lpClient(lpServiceName, apiEndpoint, apiOptions);
      //console.info("secretCache: " + secretCache);
      await updateConversationContextServiceRaw(queueHealthResponse, mavenApiKey);
      callback(null, queueHealthResponse);
    }
    main();
  }