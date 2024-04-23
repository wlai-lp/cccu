// README: this scrip parses json file in the json folder
// parse into an example class
// output result to a tab delimited txt file
// so it can be imported to googlsheet for analyzing
require("dotenv").config();

import { createClient } from "@libsql/client";

const dbclient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

import * as convoTypes from "./types";
import * as fs from "fs";
import * as path from "path";
import internal from "stream";

const filePath = "data.json";
const page = "322024";
const outputfileDir = `data/output/${page}/`;
// Directory path
const inputDir = `data/json/${page}`;
const outputFullPath = outputfileDir + page + ".txt";

const NLUDomain = "68384fbc-fa2a-4a32-b7fe-0226724e31ec";

const header = `lpconvoId\taIntent\taConvoId\tgsIntent\tstartSkill\tfinalSkill\ttransfers\tmessage\textract\n`;

console.log("start " + Date.now());

// create outputfile and prefix with header
fs.writeFile(outputFullPath, header, (err) => {
  if (err) {
    console.error("Error creating file:", err);
    return;
  }
  console.log("File created successfully:", outputFullPath);
});

console.log("reading input file dir " + inputDir);
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Iterate over the files
  files.forEach(async (file) => {
    // Full path to the file

    const filePath = path.join(inputDir, file);
    console.log("process file = " + filePath);

    // Read the JSON file
    fs.readFile(filePath, "utf8", (err, data) => {
      // console.log("hello");

      if (err) {
        console.error("Error reading the file:", err);
        return;
      }

      class Example {
        lpconvoId: string;
        aIntent: string;
        aConvoId: string;
        gsIntent: string;
        finalSkill: string;
        startSkill: string;
        transfers: number;
        payload: string;
        extract: string;
        constructor() {
          this.lpconvoId = "";
          this.aIntent = "";
          this.aConvoId = "";
          this.gsIntent = "";
          this.finalSkill = "";
          this.startSkill = "";
          this.transfers = 0;
          this.payload = "";
          this.extract = "";
        }
        toString() {
          return `${this.lpconvoId}\t${this.aIntent}\t${this.aConvoId}\t${this.gsIntent}\t${this.startSkill}\t${this.finalSkill}\t${this.transfers}\t${this.payload}\t${this.extract}\n`;
        }
      }

      try {
        // Parse the JSON data
        const jsonData1 = JSON.parse(data);
        // const jsonData = jsonData1.conversationHistoryRecords;
        const jsonData: convoTypes.Root = jsonData1;
        // console.log(jsonData._metadata);
        const convos: convoTypes.ConversationHistoryRecord[] =
          jsonData.conversationHistoryRecords;
        // console.log(convos.length);
        let i = 0;
        let intents: string[] = [];
        for (const convo of convos) {
          let example: Example = new Example();
          let appleIntent = "";
          // console.log(convo.messageRecords[0].messageData.msg.text);
          // if(!convo.messageRecords[0].messageData.msg.text.includes("\n") || !convo.messageRecords[0])
          //     continue;

          // console.log(JSON.stringify(convo.messageRecords))

          const msg: string[] =
            convo.messageRecords[0].messageData.msg.text.split("\n");
          const aIntnet = msg[3];
          const aConvoId = msg[4];
          example.lpconvoId = convo.info.conversationId;
          example.aIntent = aIntnet;
          example.aConvoId = aConvoId;
          example.payload = cleanPayload(
            convo.messageRecords[0].messageData.msg.text
          );
          const payloadMsg = convo.messageRecords[0].messageData.msg.text;
          // console.log("🚀 ~ fs.readFile ~ payloadMsg:", payloadMsg)
          const extractStr = extractPayload(payloadMsg);
          const lastLine = getLastLine(payloadMsg);
          const fullMsg = extractStr + " " + lastLine;
          example.extract = fullMsg;
          intents.push(fullMsg);

          // get the latest transfer event
          let lastTime = 0;
          let firstTime = 2701450003915;
          for (const t of convo.transfers) {
            example.transfers++;
            if (t.timeL < firstTime) {
              example.startSkill = t.sourceSkillName;
              firstTime = t.timeL;
            }
            if (t.timeL > lastTime) {
              // console.log(t.sourceSkillName)
              example.finalSkill = t.targetSkillName;
              lastTime = t.timeL;
            }
          }

          i++;
          // const customerInfo = convo.sdes.events[0].customerInfo;
          for (const event of convo.sdes.events) {
            if (event.sdeType == "CUSTOMER_INFO") {
              appleIntent = event.customerInfo?.customerInfo.companyBranch!;
              example.gsIntent =
                event.customerInfo?.customerInfo.companyBranch!;
            }
          }
          // console.log("no. " + i + " = " + convo.info.conversationId + ", apple intent = " + appleIntent);
          // console.log("apple intent is " + appleIntent);

          // here's where we put all the custom transfer logic evaluation

          //   console.log(example.toString());
          fs.appendFile(outputFullPath, example.toString(), (err) => {
            if (err) {
              console.error("Error writing to file:", err);
              return;
            }
            // console.log("Data has been written to the file:", outputFullPath);
          });
        }
        console.log(intents.length);
        analyzeIntent(intents);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
      }
    });
  });
});

console.log("done " + Date.now());

function cleanPayload(msg: string) {
  // const msg = "****Start Conversation Context****\n\nSource: BOT\nIntent: payment_hold_list\nApple Conversation ID: 1701968235955-515498ff5b3efa77207d3a18b99228e16440\n\nTranscript:\n\n[11:57  EST] customer: \"I’d like some help with a payment.\"\n\n[11:57  EST] NLP_BOT: \"I can help with this Apple Card payment. Which best describes your issue?\n\n1. Cancel payment\n2. Available credit after payment\n3. Something else\"\n\n[11:57  EST] customer: \"Available credit after payment\"\n\n[11:57  EST] NLP_BOT: \"Thanks. Just a moment while Goldman Sachs reviews your request.\"\n\n[11:57  EST] NLP_BOT: \"Thanks. Just a moment while Goldman Sachs reviews your request.\"\n\n****End Conversation Context****\n\ni'd like some help with a payment."

  const cleanDoubleQuote = msg.replace(/\"/g, "'");

  const strArray = cleanDoubleQuote.split("\n").filter((e) => e.length > 0);

  let result = "=CONCATENATE(";
  for (const s of strArray) {
    result = result + '"' + s + '"' + ",CHAR(10),";
  }
  result = result.substring(0, result.length - 10) + ")";
  // console.log("🚀 ~ cleanPayload ~ result:", result)
  //   console.log(result);
  return result;
}

function extractPayload(msg: string) {
  // console.log("🚀 ~ extractPayload ~ msg:", msg)
  const text = '[09:20 EST] customer: "I need help with this payment"';
  const regex = /customer:\s*"([^"]*)"/gi; // Match "customer:" followed by non-quote characters inside quotes (global flag)
  let match;
  let finalStr = "";
  while ((match = regex.exec(msg)) !== null) {
    const parsedText = match[1].trim(); // Extracting the part after "customer:"
    // console.log("🚀 ~ extractPayload ~ parsedText:", parsedText)
    finalStr = finalStr + " " + parsedText;
  }
  return finalStr;
}

function getLastLine(msg: string) {
  //   const text = `****End Conversation Context****
  // hello can i change trevion to a co owner instead of participant`;
  const lines = msg.split("\n");
  const lastLine = lines[lines.length - 1].trim();
  // console.log("🚀🚀🚀🚀 ~ getLastLine ~ lastLine:", lastLine)
  return !lastLine.includes("End Conversation Context") ? lastLine : "";
}
async function analyzeIntent(intents: string[]) {
  const tokenHeaders = tokenHeader();

  const tokenOptions = tokenOption(tokenHeaders);

  const response = await fetch(
    "https://us.livepersonapis.com/auth/v2/accesstoken?grant_type=client_credentials",
    tokenOptions
  );
  const jsonData = await response.json();
  const access_token = jsonData.access_token;
  // console.log("🚀 ~ files.forEach ~ access_token:", access_token);

  // MARK: intent
  for (let idx in intents) {
    // console.log("process intent")
    const intentResult: convoTypes.IntentResult = await postData(
      intents[idx],
      access_token
    );
    const record = await insertIntentRecord(intentResult);
    console.log("🚀 ~ analyzeIntent ~ intentResult:", intentResult)
    console.log(
      "🚀 ~ " +
        intentResult.success +
        " " +
        intentResult.message +
        " " +
        intentResult.successResult.match_results[0].inputSentence
    );
    // this just wait before doing the next call
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // const raw = JSON.stringify({
  //   input: fullMsg,
  //   predictAcrossDomain: true,
  // });

  // const requestOptions = {
  //   method: "POST",
  //   headers: myHeaders,
  //   body: raw,
  // };

  // const result = await fetch(
  //   "https://us.livepersonapis.com/cb/nlu/v1/accounts/36416044/domains/68384fbc-fa2a-4a32-b7fe-0226724e31ec/intentDetection/predict",
  //   requestOptions
  // );
  // const jsonObject = await result.json();
  // console.log(JSON.stringify(jsonObject));
}

// Function to perform a single API POST request
// MARK: postdata
async function postData(intent: string, access_token: string): Promise<any> {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", "jeXR0XggdGcIDKtdYymmhF137CNcdqUA");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${access_token}`);

  const raw = JSON.stringify({
    input: intent,
    predictAcrossDomain: true,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  const result = await fetch(
    "https://us.livepersonapis.com/cb/nlu/v1/accounts/36416044/domains/68384fbc-fa2a-4a32-b7fe-0226724e31ec/intentDetection/predict",
    requestOptions
  );
  const jsonObject = await result.json();
  // console.log(JSON.stringify(jsonObject));
  // console.log(process.env.TOKEN);
  return jsonObject;
}

async function createBatch(start_timestamp: number) {
  try {
    const rs = await dbclient.execute({
      sql: `insert into batch_run(start_timestamp)
            values (:start_timestamp)`,
      args: { start_timestamp },
    });
    // lastInsertRowid is primary key
    console.log(`batchTable last insert record is ${rs.lastInsertRowid}`);
    return rs.lastInsertRowid;
  } catch (error: any) {
    console.error("⛔ ~ batchTable createBatch: ~ error:", error.message);
  }
}

function tokenHeader() {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", "jeXR0XggdGcIDKtdYymmhF137CNcdqUA");
  myHeaders.append(
    "Authorization",
    "Basic amVYUjBYZ2dkR2NJREt0ZFl5bW1oRjEzN0NOY2RxVUE6VVVTV1ZuMktrdEpFQm1hQg=="
  );
  return myHeaders;
}

function tokenOption(myHeaders) {
  return {
    method: "POST",
    headers: myHeaders,
  };
}
async function insertIntentRecord(intentResult: convoTypes.IntentResult) {
  try {
    const message = intentResult.message
    const inputSentence = intentResult.successResult.match_results[0].inputSentence
    const intentName = intentResult.successResult.match_results[0].intentName
    const rs = await dbclient.execute({
      sql: `insert into intent_call(message, inputSentence, intentName)
            values (:message, :inputSentence, :intentName)`,
      args: { message, inputSentence, intentName },
    });
    // lastInsertRowid is primary key
    console.log(`batchTable last insert record is ${rs.lastInsertRowid}`);
    return rs.lastInsertRowid;
  } catch (error: any) {
    console.error("⛔ ~ batchTable createBatch: ~ error:", error.message);
  }
}
