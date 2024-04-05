const msg = "****Start Conversation Context****\n\nSource: BOT\nIntent: payment_hold_list\nApple Conversation ID: 1701968235955-515498ff5b3efa77207d3a18b99228e16440\n\nTranscript:\n\n[11:57  EST] customer: \"I’d like some help with a payment.\"\n\n[11:57  EST] NLP_BOT: \"I can help with this Apple Card payment. Which best describes your issue?\n\n1. Cancel payment\n2. Available credit after payment\n3. Something else\"\n\n[11:57  EST] customer: \"Available credit after payment\"\n\n[11:57  EST] NLP_BOT: \"Thanks. Just a moment while Goldman Sachs reviews your request.\"\n\n[11:57  EST] NLP_BOT: \"Thanks. Just a moment while Goldman Sachs reviews your request.\"\n\n****End Conversation Context****\n\ni'd like some help with a payment."

const cleanDoubleQuote = msg.replace(/\"/g, "'")

const strArray = cleanDoubleQuote.split("\n").filter((e) => e.length > 0)

let result = "=CONCATENATE("
for(s of strArray){
    result = result + '"' + s + '"' + ",CHAR(10),"
}
result = result.substring(0, result.length-10) + ")"
console.log(result)