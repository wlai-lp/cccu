var e = botContext.getGlobalContextData('EscalationBot', 'skillsMetrics');
var currentSkill = botContext.getLPEngagementAttribute("currentSkillId");
//var currentSkill=botContext.skillToRoute();
botContext.setBotVariable("currentSkill", currentSkill, true, false);
debugSendMessage("currentSkill: "+ currentSkill);
var skillToRoute = botContext.getBotVariable("skillToRoute");
debugSendMessage("skillToRoute: "+ skillToRoute);
var awt = e[skillToRoute].avgWaitTimeForAgentAssignment_AfterTransferFromBot;

var convoInQueue=e[skillToRoute].actionableConversations;
//var awt = e[skillToRoute].maxWaitTimeForAgentAssignment;
//var awt= -1;
//var convoInQueue=3;
var minutes = Math.floor(awt / 60000);
botContext.setBotVariable('awt', awt, true, false);
debugSendMessage("awt was: " + awt);
debugSendMessage("convoInQueue was: " + convoInQueue);
if(awt > 10800000)
{
  //botContext.sendImmediateReply('Next agent will be available within '+minutes+' minutes');
  debugSendMessage("bot_morethan30_waitTime" );
  botContext.logCustomEvent('convoInQueue was: ' + convoInQueue, 'awt > 3 hours', 'skillToRoute was: ' + skillToRoute + ' awt is: ' + awt);
  botContext.setTriggerNextMessage("bot_morethan30_waitTime");
}
else if(awt>60000 && awt <= 3600000)
{
  botContext.sendImmediateReply('The current estimated wait time is '+minutes+' minutes. Thank you for your patience.');
   debugSendMessage("bot_lessthan30_waitTime" );
  botContext.setTriggerNextMessage("bot_lessthan30_waitTime");
}

else if(awt>3600000 && awt <= 10800000)
{
  botContext.sendImmediateReply('The current wait time is estimated to be over 1 hour due to unexpected high demand. We apologize for the inconvenience and appreciate your patience.');
   debugSendMessage("bot_lessthan30_waitTime" );
  botContext.setTriggerNextMessage("bot_lessthan30_waitTime");
}

else if(awt === -1)
{
  if(convoInQueue===0){
    botContext.sendImmediateReply('You are next in line');
    debugSendMessage("bot_EmptyQueue" );
    botContext.setTriggerNextMessage("bot_EmptyQueue");
  }
  else {
    debugSendMessage("out_of_working_hours" );
    botContext.logCustomEvent('convoInQueue was: ' + convoInQueue,'Out of working hour awt', 'skillToRoute was: ' + skillToRoute + ' awt is: ' + awt);
    botContext.setTriggerNextMessage("out_of_working_hours");
  }
}