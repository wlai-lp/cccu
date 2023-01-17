const {
  Toolbelt,
  LpServices
} = require("lp-faas-toolbelt");
const httpClient = Toolbelt.HTTPClient();
const lpClient = Toolbelt.LpClient();

const skillsArray = process.env.AGENT_SKILL_IDS.split(',');
const caseEndpoint = process.env.CASE_ENDPOINT;
const transferEndpoint =  process.env.TRANSFER_ENDPOINT;

let secretCache = {};

/**
* Cache the secrets to avoid unneeded calls to secret store and be more resilience
* in case of request errors
*/
async function lazyLoadSecret(name) {
  if (secretCache[name] !== undefined) {
      return secretCache[name];
  }

  const client = Toolbelt.SecretClient();
  const { value } = await client.readSecret(name);

  secretCache[name] = value;
  return value;
}

/**
* Logic that runs when an LP chat is escalated to a human agent. This passes a payload
* including the chat transcript and the agent to Salesforce where an SFDC case is created.
*/
async function lambda(input, callback) {
  try {
      let conversation = input.payload;
      let convId = conversation.general.convId;
      let skill = conversation.routing.newSkillId;

      if (!skillsArray.includes(skill)) {
          callback(null, null);
      } else {
          const startTime = Date.now() / 1000;

          // If there is an error here it will be caught in the global try/catch and function will stops ending in error
          const muleAuthHeader =  await lazyLoadSecret('authHeader');
          const mavenApiKey =  await lazyLoadSecret('mavenApiKey');

          if (!process.env.BRAND_ID || !process.env.CONTEXT_WAREHOUSE_NAME) {
              console.error("Unset env vars: brandId or warehouse")
              // This will be caught dont need here to continue if there is an error since next request will fail
              throw new Error("Unset env vars: brandId or warehouse");
          }

          const URL = `https://z1.context.liveperson.net/v1/account/${process.env.BRAND_ID}/${process.env.CONTEXT_WAREHOUSE_NAME}/${convId}/properties`;

          const usersData = await lpClient(
              LpServices.ACCOUNT_CONFIG_READ_WRITE,
              `/api/account/${process.env.BRAND_ID}/configuration/le-users/users?v=4`,
              {
                  method: 'GET',
                  json: true,
              }
          )
           if (!Array.isArray(usersData) || usersData.length == 0) {
              throw new Error("Failed to get users data.");
          }

          const response = await httpClient(URL, {
              method: "GET",
              headers: {
                  "maven-api-key": mavenApiKey
              },
              simple: true,
              resolveWithFullResponse: true
          })

          // We don't need checkHTTPStatus since if you use "simple: true" in the HTTPClient it will reject when there is a non 2xx status code so the other checks won't be called
          const data = JSON.parse(response.body);

          if (!data['caseCreated'] && data['email']) {
              await httpClient(caseEndpoint, {
                  method: "POST",
                  headers: {
                      Authorization: `Basic ${muleAuthHeader}`,
                      'Content-Type': 'application/json'
                  },
                  simple: true,
                  resolveWithFullResponse: true,
                  body: {
                      SuppliedEmail: data['email'],
                      Subject: data['lastIntent'],
                      Chat_ID__c: data['conversationId'],
                      origin: "Live_Message",
                      Description: JSON.stringify({
                          'Conversation ID': data['conversationId'],
                          'User ID': data['userId'],
                          Intent: data['lastIntent']
                      }),
                      Customer_Intent__c: data['lastIntent']
                  },
                  json: true,
              })

             await httpClient(URL, {
                  method: "PATCH",
                  headers: {
                      "maven-api-key": mavenApiKey
                  },
                  simple: true,
                  resolveWithFullResponse: true,
                  body: {
                      caseCreated: true,
                  },
                  json: true,
              })
          }

          const newParticipantIds = [];
          conversation.participantChange.newParticipants.forEach((par) => {
              if(par.role.toUpperCase() === "ASSIGNED_AGENT"){
                  newParticipantIds.push(par.id)
              }
          })

          const assignedAgents = newParticipantIds.map((id) => usersData.find((user) => user.pid === id))

          if (assignedAgents.length >= 5) {
              console.info("More than 4 agents have been assigned to this case.");
          }

          await httpClient(transferEndpoint, {
              method: 'PUT',
              headers: {
                  Authorization: `Basic ${muleAuthHeader}`,
                  'Content-Type': 'application/json'
              },
              simple: true,
              resolveWithFullResponse: true,
              body: {
                  event: 'participant_change',
                  conversationID: conversation.general.convId,
                  participantChange: conversation.participantChange,
                  users: assignedAgents,
                  skill: skill,
              },
              json: true,
          });

          const endTime = Date.now() / 1000;

          const timeOfExec = endTime - startTime;
          if (timeOfExec > 25) {
              console.info('conversationParticipantChange execution finished in ' + timeOfExec.toString() + ' seconds.');
          }

          callback(null, null);
      }
  } catch(error) {
      console.error('Something wrong happened', error.message);
      // If you pass the error in the callback in the first param the function will end with error and the bot which invokes te function will retry the invocation
      // If you don't want to retry the invocation just changer the callback by callback(null, `Something wrong happened` );  it will end as successful if the first argument is null
      callback(error,'Something wrong happened');
  }
} // Deployment Aug 31, 2022
