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
    messageRecords: MessageRecord[]
    agentParticipants: AgentParticipant[]
    consumerParticipants: ConsumerParticipant[]
    transfers: Transfer[]
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
    companyBranch: string
    accountName?: string
    imei?: string
  }
  
  export interface PersonalInfo {
    serverTimeStamp: string
    originalTimeStamp: number
    personalInfo: PersonalInfo2
  }
  
  export interface PersonalInfo2 {
    company?: string
    language: string
    contacts: Contact[]
    surname?: string
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
  
  export interface IntentResult {
  success:       boolean;
  successResult: SuccessResult;
  message:       string;
}

export interface SuccessResult {
  match_results: MatchResult[];
}

export interface MatchResult {
  inputSentence:                 string;
  intentName:                    string;
  intentId:                      string;
  displayName:                   string;
  chatBotPlatformUserId:         null;
  chatBotId:                     null;
  status:                        string;
  word2vecNLUResult:             null;
  wordnetNLUResult:              null;
  inputSentenceNLP:              null;
  minDistance:                   number;
  score:                         null;
  knowledgeDataSourceId:         null;
  knowledgeArticleId:            null;
  language:                      null;
  originalSentence:              string;
  entityProcessedSentence:       null;
  keyPhrasesMatched:             null;
  metaIntent:                    string;
  metaIntentId:                  string;
  slotValues:                    null;
  entityValues:                  null;
  domainId:                      null;
  domainName:                    null;
  domainType:                    null;
  modelVersionId:                null;
  modelVersion:                  null;
  domainModelVersion:            null;
  source:                        null;
  nerResponse:                   null;
  includesGeneratedTrainingData: null;
  keyPhraseMatch:                boolean;
  combinedAverageMinDistance:    number;
  adjustedMinDistance:           number;
  domainTypeName:                string;
  primaryDomain:                 null;
}
