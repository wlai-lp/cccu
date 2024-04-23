import * as convoTypes from "./types";
import * as fs from "fs";
import { cleanPayload, extractPayload, getLastLine, outputFullPath } from "./runbun-parsejsonandextract";

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

/** example payload
"****Start Conversation Context****
Source: BOT
Intent: transaction_otherissue
Apple Conversation ID: 1701903029603-6261d0f393b56dfa9bc46b5d40ad2f4c2891
Transcript:
[05:50  EST] customer: 'I’d like some help with a transaction in the amount of $120.72 at Farmacia Pharmark on December 6, 2023 at 4:44 PM.
It looks like I was charged two times. I only bought this one time. 
$120.72 should have been rang up only one time.
Thanks-
Wes Shepherd
252-714-4875'
[05:50  EST] NLP_BOT: 'You’re now connected to the Apple Card team at Goldman Sachs.  A Specialist will send you a message here after reviewing your account.'
****End Conversation Context****
Transferring to agent."
 */

export function ReadJsonFile(filePath: string) {
  fs.readFile(filePath, "utf8", (err, data) => {
    // console.log("hello");
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    try {
      // Parse the JSON data
      const jsonData: convoTypes.Root = JSON.parse(data);
      const convos: convoTypes.ConversationHistoryRecord[] = jsonData.conversationHistoryRecords;
      // console.log(convos.length);
      let i = 0;
      let intents: string[] = [];
      // for each convo in json, extract info and use Example class to host data elements
      for (const convo of convos) {
        let example: Example = new Example();
        // the 1st msg of the convo has the payload, see example payload for elements
        const msg: string[] = convo.messageRecords[0].messageData.msg.text.split("\n");
        const aIntnet = msg[3];
        const aConvoId = msg[4];
        example.lpconvoId = convo.info.conversationId;
        example.aIntent = aIntnet;
        example.aConvoId = aConvoId;
        // clean payload is to formate it so it can be paste into google sheet
        example.payload = cleanPayload(
          convo.messageRecords[0].messageData.msg.text
        );
        const payloadMsg = convo.messageRecords[0].messageData.msg.text;
        // we need to extract payload for consumer message only, so we can send it to LP NLU
        // the algo is to combine all consumer: and last line of the payload if it's not End Conversation
        // probably should exclude all that might messed up NLU
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
            appleIntent = (event.customerInfo?.customerInfo.companyBranch)!;
            example.gsIntent =
              (
                event.customerInfo?.customerInfo.companyBranch)!;
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
      // analyzeIntent(intents);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  });
}
