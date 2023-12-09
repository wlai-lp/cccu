console.log("hi")
const fs = require('fs');

const filePath = 'sdes.json';
// const filePath = 'data.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
//   const conversationHistoryRecords = jsonData.conversationHistoryRecords;
//   console.log(conversationHistoryRecords.length)

//   conversationHistoryRecords.forEach(element => {
//     console.log(element);
//   });

jsonData.events.forEach(element =>{
    if(element.sdeType == "CUSTOMER_INFO"){
        // console.log(element.customerInfo.customerInfo.accountName)
        console.log(element.sdeType + "\t" + element.customerInfo.customerInfo.accountName + "\t" + element.serverTimeStamp + "\t" + new Date(element.serverTimeStamp).toLocaleDateString() + " " + new Date(element.serverTimeStamp).toLocaleTimeString());
    }
});
  
//   console.log('JSON data:', jsonData);
//   console.log('JSON data:', conversationHistoryRecords);
} catch (error) {
  console.error('Error:', error);
}
