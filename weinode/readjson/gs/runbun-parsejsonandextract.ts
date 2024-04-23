// README: this scrip parses json file in the json folder
// parse into an example class
// output result to a tab delimited txt file
// so it can be imported to googlsheet for analyzing

import * as convoTypes from "./types";
import * as fs from "fs";
import * as path from "path";
import { ReadJsonFile } from "./ReadJsonFile";

// output setup
const page = "005";
const outputfileDir = `data/output/${page}/`;
createFolder(outputfileDir);

// input setup
const inputDir = `data/json/${page}`;
export const outputFullPath = outputfileDir + page + ".txt";

const header = `lpconvoId\taIntent\taConvoId\tgsIntent\tstartSkill\tfinalSkill\ttransfers\tmessage\textract\n`;
// create outputfile and prefix with header
createOutputFile();

console.log("reading input file dir " + inputDir);
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Iterate over the files
  ProcessInputFiles(files);
});

console.log("done " + Date.now());

function ProcessInputFiles(files: string[]) {
  files.forEach(async (file) => {
    // Full path to the file
    const filePath = path.join(inputDir, file);
    console.log("process file = " + filePath);

    // Read the JSON file
    ReadJsonFile(filePath);
  });
}

function createOutputFile() {
  fs.writeFile(outputFullPath, header, (err) => {
    if (err) {
      console.error("Error creating file:", err);
      return;
    }
    console.log("File created successfully:", outputFullPath);
  });
}

function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Folder '${folderPath}' created.`);
  } else {
    console.log(`Folder '${folderPath}' already exists.`);
  }
}

export function cleanPayload(msg: string) {
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

export function extractPayload(msg: string) {
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
  finalStr = removeNewlines(finalStr)
  return finalStr;
}

export function getLastLine(msg: string) {
  //   const text = `****End Conversation Context****
  // hello can i change trevion to a co owner instead of participant`;
  const lines = msg.split("\n");
  const lastLine = lines[lines.length - 1].trim();
  // TODO: process exceptions
  const result = dropExceptions(lastLine);
  // console.log("🚀🚀🚀🚀 ~ getLastLine ~ lastLine:", lastLine)
  return !lastLine.includes("End Conversation Context") ? lastLine : "";
}

function removeNewlines(input: string): string {
  return input.replace(/\n/g, "");
}


function dropExceptions(msg: string) {
  const exceptionStrings: string[] = [];
  // add all the exceptions here
  exceptionStrings.push("****End Conversation Context****");
  exceptionStrings.push("*** Form end ***");

  for (const str of exceptionStrings) {
    if (str.includes(msg)) {
      return "";
    }
  }
  return msg;
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
    // const record = await insertIntentRecord(intentResult);
    console.log("🚀 ~ analyzeIntent ~ intentResult:", intentResult);
    console.log(
      "🚀 ~ " +
        intentResult.success +
        " " +
        intentResult.message +
        " " +
        intentResult.successResult.match_results[0].inputSentence
    );
    // this just wait before doing the next call
    // await new Promise((resolve) => setTimeout(resolve, 100));
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
  const appKey = process.env.APPKEY;
  const basic = process.env.BASIC;
  myHeaders.append("x-api-key", appKey!);
  myHeaders.append("Authorization", `Basic ${basic}`);
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
    const message = intentResult.message;
    const inputSentence =
      intentResult.successResult.match_results[0].inputSentence;
    const intentName = intentResult.successResult.match_results[0].intentName;
    const status = intentResult.successResult.match_results[0].status;
    const metaIntent = intentResult.successResult.match_results[0].metaIntent;
    const rs = await dbclient.execute({
      sql: `insert into intent_call(message, inputSentence, intentName, status, metaIntent)
            values (:message, :inputSentence, :intentName, :status, :metaIntent)`,
      args: { message, inputSentence, intentName, status, metaIntent },
    });
    // lastInsertRowid is primary key
    console.log(`batchTable last insert record is ${rs.lastInsertRowid}`);
    return rs.lastInsertRowid;
  } catch (error: any) {
    console.error("⛔ ~ batchTable createBatch: ~ error:", error.message);
  }
}
