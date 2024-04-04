import { log } from "console";
import * as convoTypes from "./types";
import * as fs from 'fs';
import internal from "stream";

const filePath = 'data.json';

// Read the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
    // console.log("hello");
    
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

class Example  {
    lpconvoId: string;
    aIntent: string;
    aConvoId: string;
    gsIntent: string;
    finalSkill: string;
    startSkill: string;
    transfers: number;
    constructor() {
        this.lpconvoId = ''
        this.aIntent = ''
        this.aConvoId = ''
        this.gsIntent = ''
        this.finalSkill = ''
        this.startSkill = ''
        this.transfers = 0
    };
    toString(){
        return `${this.lpconvoId},${this.aIntent},${this.aConvoId},${this.gsIntent},${this.startSkill},${this.finalSkill},${this.transfers}`
    }

  }
  
  try {
    // Parse the JSON data
    const jsonData1 = JSON.parse(data);
    // const jsonData = jsonData1.conversationHistoryRecords;
    const jsonData : convoTypes.Root = jsonData1;
    // console.log(jsonData._metadata);
    const convos : convoTypes.ConversationHistoryRecord[] = jsonData.conversationHistoryRecords
    // console.log(convos.length);
    let i = 0;
    for(const convo of convos){
        let example: Example = new Example();
        let appleIntent = '';
        // console.log(convo.messageRecords[0].messageData.msg.text);
        const msg: string[] = convo.messageRecords[0].messageData.msg.text.split('\n')
        const aIntnet = msg[3];
        const aConvoId = msg[4];
        example.lpconvoId = convo.info.conversationId
        example.aIntent = aIntnet
        example.aConvoId = aConvoId
        
        // get the latest transfer event        
        let lastTime = 0;
        let firstTime = 2701450003915
        for(const t of convo.transfers){
            example.transfers++;
            if(t.timeL<firstTime){
                example.startSkill = t.sourceSkillName
                firstTime = t.timeL
            }
            if(t.timeL > lastTime){
                // console.log(t.sourceSkillName)
                example.finalSkill = t.targetSkillName
                lastTime = t.timeL
            }
        }

        i++;
        // const customerInfo = convo.sdes.events[0].customerInfo;
        for(const event of convo.sdes.events){
            if (event.sdeType == 'CUSTOMER_INFO'){
                appleIntent = event.customerInfo?.customerInfo.companyBranch!
                example.gsIntent = event.customerInfo?.customerInfo.companyBranch!
                
            }
        }
        // console.log("no. " + i + " = " + convo.info.conversationId + ", apple intent = " + appleIntent);
        // console.log("apple intent is " + appleIntent);


        // here's where we put all the custom transfer logic evaluation



        console.log(example.toString());
        
    }
    
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }


});

