const fs = require("fs");

// File path
const filePath = "example.txt";
let page = 0;
const lastPage = 1000;
// Write to file

const axios = require("axios");
let data = JSON.stringify({
  status: ["OPEN", "CLOSE"],
  start: {
    from: 1701450000000,
    to: 1701968400000,
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

for (page; page < lastPage; page++) {
  let url = `https://va.msghist.liveperson.net/messaging_history/api/account/21257964/conversations/search?source=ccuiNAWAllConEngs&offset=${page}&limit=100`;
  console.log(url);
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      accept: "*/*",
      authorization:
        "Bearer e0ba99897f604351bfcfea76c93fd0588b267496ecb37e67dcb7c0c2897c22e7",
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
        const outputfile = `json/jsonpage${offset}.json`;
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