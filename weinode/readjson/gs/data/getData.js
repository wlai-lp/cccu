const fs = require("fs");

// File path
const filePath = "example.txt";
let page = 0;
const lastPage = 20;
const token = '9639870715951bebdaa821fae52b707503e1df7d6a10115f99b867e2c3f4470f';

const fromDateString = '3/2/2024';
const toDateString = '3/3/2024';
const fromDate = new Date(fromDateString);
const toDate = new Date(toDateString);
// const timestamp = dateToTimestamp(date);
console.log(fromDate.getTime()); // Output: Unix timestamp in milliseconds
const outputFolderDate = fromDate.toLocaleDateString('en-US').replace(/\//g, '')

// TODO: need to generate output folder if it doesn't exist

// Write to file

const axios = require("axios");
let data = JSON.stringify({
  status: ["OPEN", "CLOSE"],
  start: {
    from: fromDate.getTime(),
    to: toDate.getTime(),
  },
  skillIds: ["1497707214"],
  contentToRetrieve: [
    "messageRecords",
    "agentParticipants",
    "consumerParticipants",
    "sdes",
    "transfers",
  ],
  cappingConfiguration:
    "MessagePublishEvent:1:asc,PersonalInfoEvent:10:desc,CustomerInfoEvent:10:desc,",
});

for (page; page < lastPage; page+=100) {
  let url = `https://va.msghist.liveperson.net/messaging_history/api/account/21257964/conversations/search?source=ccuiNAWAllConEngs&offset=${page}&limit=10`;
  console.log(url);
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      accept: "*/*",
      authorization:
       `Bearer ${token}`,
      "content-type": "application/json",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      console.log("write to file");
      
      const jsonData = response.data;
      const offset = jsonData._metadata.self.href;
      console.log(offset);
      const regex = /offset=(\d+)/;

      // Use the exec() method of the regular expression to extract the offset value
      const match = regex.exec(url);

      // Check if the match is found and extract the offset value
      if (match) {
        const offset = parseInt(match[1]); // Convert the matched string to a number
        console.log("Offset:", offset);
        const outputfile = `json/${outputFolderDate}/jsonpage${offset}.json`;
        fs.writeFile(outputfile, JSON.stringify(jsonData), (err) => {
            if (err) {
              console.error("Error writing to file:", err);
              return;
            }
            console.log("Data has been written to the file:", outputfile);
          });
      } else {
        console.log("Offset not found in the URL.");
      }
      
    })
    .catch((error) => {
      console.log(error);
    });
}
