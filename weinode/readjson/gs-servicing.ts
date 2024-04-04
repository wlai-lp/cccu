import { log } from "console"

console.log("npx tsx script.ts")
export interface Root {
  _metadata: Metadata
  conversationHistoryRecords: ConversationHistoryRecord[]
}

export interface Metadata {
  count: number
  self: Self
  shardsStatusResult: ShardsStatusResult
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
  messageRecords: MessageRecord[]
  agentParticipants: AgentParticipant[]
  consumerParticipants: ConsumerParticipant[]
  transfers: Transfer[]
  dialogs: Dialog[]
  conversationSurveys: any[]
  sdes: Sdes
  responseTime: ResponseTime
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
  firstIntentName: string
  firstIntentLabel: string
}

export interface MessageRecord {
  type: string
  messageData: MessageData
  messageId: string
  audience: string
  seq: number
  dialogId: string
  participantId: string
  source: string
  time: string
  timeL: number
  integrationSource: string
  sentBy: string
  contextData: ContextData
  predefinedContent?: boolean
  predefinedContentCategoryId?: string
  predefinedContentId?: string
  predefinedContentEdited?: boolean
}

export interface MessageData {
  msg: Msg
}

export interface Msg {
  text: string
}

export interface ContextData {
  rawMetadata: string
  structuredMetadata: any[]
}

export interface AgentParticipant {
  agentFullName: string
  agentNickname: string
  agentLoginName: string
  agentDeleted: boolean
  agentId: string
  agentPid: string
  userType: string
  userTypeName: string
  role: string
  agentGroupName: string
  agentGroupId: number
  time: string
  timeL: number
  permission: string
  dialogId: string
}

export interface ConsumerParticipant {
  participantId: string
  firstName: string
  lastName: string
  token: string
  email: string
  phone: string
  avatarURL: string
  time: string
  timeL: number
  joinTime: string
  joinTimeL: number
  consumerName: string
  dialogId: string
}

export interface Transfer {
  timeL: number
  time: string
  assignedAgentId: string
  targetSkillId: number
  targetSkillName: string
  reason: string
  by: string
  sourceSkillId: number
  sourceSkillName: string
  sourceAgentId: string
  sourceAgentFullName: string
  sourceAgentLoginName: string
  sourceAgentNickname: string
  dialogId: string
}

export interface Dialog {
  dialogId: string
  status: string
  dialogType: string
  dialogChannelType: string
  startTime: string
  startTimeL: number
  endTime: string
  endTimeL: number
  closeReason: string
  closeReasonDescription: string
  skillId: number
  skillName: string
}

export interface Sdes {
  events: Event[]
}

export interface Event {
  personalInfo?: PersonalInfo
  serverTimeStamp: number
  sdeType: string
  customerInfo?: CustomerInfo
}

export interface PersonalInfo {
  serverTimeStamp: number
  originalTimeStamp: number
  personalInfo: PersonalInfo2
}

export interface PersonalInfo2 {
  language: string
  contacts: Contact[]
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

export interface CustomerInfo {
  serverTimeStamp: number
  originalTimeStamp: number
  customerInfo: CustomerInfo2
}

export interface CustomerInfo2 {
  customerStatus: string
  customerType: string
  customerId: string
  socialId: string
  userName: string
  companyBranch: string
}

export interface ResponseTime {
  latestEffectiveResponseDueTime: number
  configuredResponseTime: number
}

  
  const fs = require('fs');

// Specify the path to your JSON file
const filePath = 'gs-servicing.json';

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
      // check to make sure it's transfered from predic to servicing
      let transferFlag = false;
      for(const transfer of convo.transfers){
        if(transfer.targetSkillName == '[Internal] Servicing' && transfer.sourceSkillName == '[Internal] Predictive Routing'){
          transferFlag = true;
          console.log("xxx transfer flag set")
          break
        }
      }

        let appleIntent = '';
        i++;
        // const customerInfo = convo.sdes.events[0].customerInfo;
        for(const event of convo.sdes.events){
            if (event.sdeType == 'CUSTOMER_INFO'){
                appleIntent = event.customerInfo?.customerInfo.companyBranch!
                
            }
        }
        if(transferFlag){
          console.log("no. " + i + " = " + convo.info.conversationId + ", apple intent = " + appleIntent);
        }
        // console.log("apple intent is " + appleIntent);
        
    }
    
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }

  
});
