import { log } from "console"

console.log("npx tsx script.ts")

export interface Root {
    _metadata: Metadata
    conversationHistoryRecords: ConversationHistoryRecord[]
  }
  
  export interface Metadata {
    count: number
    next: Next
    last: Last
    self: Self
    shardsStatusResult: ShardsStatusResult
  }
  
  export interface Next {
    rel: string
    href: string
  }
  
  export interface Last {
    rel: string
    href: string
  }
  
  export interface Self {
    rel: string
    href: string
  }
  
  export interface ShardsStatusResult {
    partialResult: boolean
  }
  
  export interface ConversationHistoryRecord {
    info: Info
    sdes: Sdes
  }
  
  export interface Info {
    startTime: string
    startTimeL: number
    endTime: string
    endTimeL: number
    conversationEndTime: string
    conversationEndTimeL: number
    fullDialogEndTime: string
    fullDialogEndTimeL: number
    duration: number
    conversationId: string
    brandId: string
    latestAgentId: string
    latestAgentNickname: string
    latestAgentFullName: string
    latestAgentLoginName: string
    agentDeleted: boolean
    latestSkillId: number
    latestSkillName: string
    source: string
    closeReason: string
    closeReasonDescription: string
    mcs: number
    alertedMCS: number
    status: string
    fullDialogStatus: string
    firstConversation: boolean
    latestAgentGroupId: number
    latestAgentGroupName: string
    latestQueueState: string
    isPartial: boolean
    features: string[]
    appId: string
    ipAddress: string
    latestHandlerAccountId: string
    latestHandlerSkillId: number
    firstIntentName?: string
    firstIntentLabel?: string
  }
  
  export interface Sdes {
    events: Event[]
  }
  
  export interface Event {
    customerInfo?: CustomerInfo
    sdeType: string
    serverTimeStamp: string
    personalInfo?: PersonalInfo
  }
  
  export interface CustomerInfo {
    serverTimeStamp: string
    originalTimeStamp: number
    customerInfo: CustomerInfo2
  }
  
  export interface CustomerInfo2 {
    customerStatus: string
    customerType: string
    customerId: string
    socialId: string
    userName: string
    accountName: string
    companyBranch: string
    imei?: string
  }
  
  export interface PersonalInfo {
    serverTimeStamp: string
    originalTimeStamp: number
    personalInfo: PersonalInfo2
  }
  
  export interface PersonalInfo2 {
    company: string
    language: string
    contacts: Contact[]
    surname?: string
    name?: string
  }
  
  export interface Contact {
    personalContact: PersonalContact
  }
  
  export interface PersonalContact {
    email: string
    phone: any
    phoneType: any
    address: any
    preferredContactMethod: any
  }
  
  const fs = require('fs');

// Specify the path to your JSON file
const filePath = 'gs-disput.json';

// Read the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  try {
    // Parse the JSON data
    const jsonData1 = JSON.parse(data);
    // const jsonData = jsonData1.conversationHistoryRecords;
    const jsonData : Root = jsonData1;
    console.log(jsonData._metadata);
    const convos : ConversationHistoryRecord[] = jsonData.conversationHistoryRecords
    console.log(convos.length);
    let i = 0;
    for(const convo of convos){
        let appleIntent = '';
        i++;
        // const customerInfo = convo.sdes.events[0].customerInfo;
        for(const event of convo.sdes.events){
            if (event.sdeType == 'CUSTOMER_INFO'){
                appleIntent = event.customerInfo?.customerInfo.companyBranch!
                
            }
        }
        console.log("no. " + i + " = " + convo.info.conversationId + ", apple intent = " + appleIntent);
        // console.log("apple intent is " + appleIntent);
        
    }
    
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }

  
});
