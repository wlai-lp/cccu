// README: this scrip parses json file in the json folder
// parse into an example class
// output result to a tab delimited txt file
// so it can be imported to googlsheet for analyzing

import * as convoTypes from "./types";
import * as fs from "fs";
import * as path from "path";
import internal from "stream";

const filePath = "data.json";
const page = "003";
const outputfileDir = `data/output/${page}/`;
// Directory path
const inputDir = `data/json/${page}`;
const outputFullPath = outputfileDir + page + ".txt";

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
  files.forEach((file) => {
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
          const payloadMsg = convo.messageRecords[0].messageData.msg.text
          console.log("🚀 ~ fs.readFile ~ payloadMsg:", payloadMsg)
          const extractStr = extractPayload(payloadMsg);
          const lastLine = getLastLine(payloadMsg);
          example.extract = extractStr + " " + lastLine;

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
  const regex = /customer:\s*"([^"]*)"/ig; // Match "customer:" followed by non-quote characters inside quotes (global flag)
  let match;
  let finalStr = ""
  while ((match = regex.exec(msg)) !== null) {
      const parsedText = match[1].trim(); // Extracting the part after "customer:"
      console.log("🚀 ~ extractPayload ~ parsedText:", parsedText)
      finalStr = finalStr + " " + parsedText
  }
  return finalStr
}

function getLastLine(msg: string){
//   const text = `****End Conversation Context****
// hello can i change trevion to a co owner instead of participant`;
  const lines = msg.split('\n');
  const lastLine = lines[lines.length - 1].trim();
  console.log("🚀🚀🚀🚀 ~ getLastLine ~ lastLine:", lastLine)
  return (!lastLine.includes("End Conversation Context")) ? lastLine : ""


  // const regex = /.*(?:[\r\n]+([^]+))/;
  // const match = msg.match(regex);

  // if (match && match.length > 1) {
  //     const lastLine = match[1].trim();
  //     console.log("🚀 ~ getLastLine ~ lastLine:", lastLine)
  //     return (!lastLine.includes("End Conversation Context")) ? lastLine : ""
  // } else {
  //     console.log("No match found.");
  // }
  // return ""

}