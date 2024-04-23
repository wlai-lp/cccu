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
  finalStr = removeSpecialChars(finalStr)
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
  return result;
}

function removeSpecialChars(input: string): string {
  return input.replace(/[\n&]/g, "");
}


function dropExceptions(msg: string) {
  const exceptionStrings: string[] = [];
  // add all the exceptions here
  // usage, exceptionString should contain the subString of msg that you want to filter
  // for example msg is *** Form end ***
  // we just add exception Form end
  exceptionStrings.push("End Conversation Context");
  exceptionStrings.push("Form end");
  exceptionStrings.push("Transferring to agent");
  
  for (const str of exceptionStrings) {  
    if (msg.includes(str)) {
      console.log("🚀 ~ dropExceptions ~ str:", str)
      return "";
    }
  }
  return msg;
}
