/**
hey have participantChange FaaS which needs to be refactored to add promises + retries
we want to enhance this faas to be promise based and add logs
and retries
*/


const { Toolbelt, LpServices } = require("lp-faas-toolbelt");
const httpClient = Toolbelt.HTTPClient();
const lpClient = Toolbelt.LpClient();
const secretClient = Toolbelt.SecretClient();

const skillsArray = process.env.AGENT_SKILL_IDS.split(",");
const caseEndpoint = process.env.CASE_ENDPOINT;
const transferEndpoint = process.env.TRANSFER_ENDPOINT;
const startTime = Date.now();

let secretCache = {};
let CCSUrl;
let convId;

/**
 * Cache the secrets to avoid unneeded calls to secret store and be more resilience
 * in case of request errors
 */
async function lazyLoadSecret(name) {
  if (secretCache[name]) {
    return secretCache[name];
  }

  const { value } = await secretClient.readSecret(name);

  secretCache[name] = value;
  return value;
}

async function getAccountUsers() {
  return await lpClient(LpServices.ACCOUNT_CONFIG_READ_WRITE, `/api/account/${process.env.BRAND_ID}/configuration/le-users/users?v=4`, {
    method: "GET",
    json: true,
  });
}

async function getSessionsPrperties() {
  return await httpClient(CCSUrl, {
    method: "GET",
    headers: {
      "maven-api-key": await lazyLoadSecret("mavenApiKey"),
    },
    simple: true,
    json: true,
  });
}

async function createCase(data) {
  // create case
  await httpClient(caseEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${await lazyLoadSecret("authHeader")}`,
      "Content-Type": "application/json",
    },
    simple: true,
    body: {
      SuppliedEmail: data.email,
      Subject: data.lastIntent,
      Chat_ID__c: data.conversationId,
      origin: "Live_Message",
      Description: JSON.stringify({
        "Conversation ID": data.conversationId,
        "User ID": data.userId,
        Intent: data.lastIntent,
      }),
      Customer_Intent__c: data.lastIntent,
    },
    json: true,
  });
}

async function markCaseCreated() {
  // mark as created inside of session's properties
  await httpClient(CCSUrl, {
    method: "PATCH",
    headers: {
      "maven-api-key": await lazyLoadSecret("mavenApiKey"),
    },
    simple: true,
    body: {
      caseCreated: true,
    },
    json: true,
  });
}

async function transfer(conv, users, skill) {
  return await httpClient(transferEndpoint, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${await lazyLoadSecret("authHeader")}`,
      "Content-Type": "application/json",
    },
    simple: true,
    body: {
      event: "participant_change",
      conversationID: conv.general.convId,
      participantChange: conv.participantChange,
      users,
      skill,
    },
    json: true,
  });
}

function retryWrapper(argFn) {
  const pauseBetweenAttempt = 1000; // in milliseconds
  const timeOut = (msecs) => new Promise((res) => setTimeout(res, msecs));
  let attemptCount = 2;
  return async function retryFn() {
    attemptCount -= 1;
    try {
      if (attemptCount >= 0) throw new Error('myErr'); // TODO Remove after testing
      return await argFn.apply(this, arguments);
    } catch (error) {
      if (attemptCount > 0) {
        // uncomment next line to make a pause between action calls
        // await timeOut(pauseBetweenAttempt);
        return await retryFn.apply(this, arguments);
      }
      console.error(convId, argFn.name, "Retry errror", error.message.slice(0, 500));
      // to continue an execution of the lambda just return null instead of rising error
      throw new Error(error);
    }
  };
}

function timeOfExec() {
  return Date.now() - startTime;
}

async function handler(input) {
  const conversation = input.payload;
  convId = conversation.general.convId;
  const skill = conversation.routing.newSkillId;

  // check a skill & proceed some actions if it is right skill
  if (skillsArray.includes(skill)) {
    CCSUrl = `https://z1.context.liveperson.net/v1/account/${process.env.BRAND_ID}/${process.env.CONTEXT_WAREHOUSE_NAME}/${convId}/properties`;
    // get all users from the account
    console.info(convId, "getAccountUsers");
    const usersData = await getAccountUsers();
    // if retries are needed use function call in the next line

    if (!Array.isArray(usersData) || usersData.length == 0) {
      // doesn't make sence to continue
      throw new Error("Failed to get users data.");
    }

    // get all session's properties (session ID is a conversation ID )
    console.info(convId, "getSessionsPrperties");

    // if retries are needed use the function call in the next line instead of previous
    const data = await retryWrapper(getSessionsPrperties)();

    // check if case is not created yet and the customer's email exist
    if (!data.caseCreated && data.email) {
      // create a case
      console.info(convId, "createCase");
      await createCase(data);
      // if retries are needed use the function call in the next line instead of previous

      // mark as created inside of session's properties
      console.info(convId, "markCaseCreated");
      // if retries are needed use the function call in the next line instead of previous
      await retryWrapper(markCaseCreated)();
    }

    const newParticipantIds = conversation.participantChange.newParticipants.reduce((res, participant) => {
      if (participant.role.toUpperCase() === "ASSIGNED_AGENT") res.push(participant.id);
      return res;
    }, []);

    // get assigned agents
    const assignedAgents = newParticipantIds.reduce((res, id) => {
      const agent = usersData.find((user) => user.pid === id);
      if (agent) res.push(agent);
      return res;
    }, []);

    /* if (assignedAgents.length >= 5) {
            console.info("More than 4 agents have been assigned to this case.");
        }*/

    // transfer
    console.info(convId, "Transfer");
    await transfer(conversation, assignedAgents, skill);
    // if retries are needed use the function call in the next line instead of previous

    const endTime = timeOfExec();
    console.info(convId, "Successfully completed in " + endTime + " milliseconds.");

    return "Successfully completed in " + endTime + " milliseconds.";
  }
}

/**
 * Logic that runs when an LP chat is escalated to a human agent. This passes a payload
 * including the chat transcript and the agent to Salesforce where an SFDC case is created.
 */
async function lambda(input, callback) {
  try {
    const result = await handler(input);
    callback(null, result);
  } catch (error) {
    console.error(convId, "Error", error.message.slice(0, 500));
    // If you pass the error in the callback in the first param the function will end with error and the bot which invokes te function will retry the invocation
    // If you don't want to retry the invocation just changer the callback by callback(null, `Something wrong happened` );  it will end as successful if the first argument is null
    callback(error, "Something wrong happened");
  }
}

module.exports = lambda;
