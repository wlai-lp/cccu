// utility app to search cb ccs for convos
require("dotenv").config();
var request = require("request");
const readline = require("readline");
const fs = require("fs");

class ConvIDData{
  constructor(convId, hasConvId, hasUserId, hasCaseCreated, hasEmail, hasLastIntent, caseCreated, email){
    this.convId = convId;
    this.hasConvId = hasConvId;
    this.hasUserId = hasUserId;
    this.hasCaseCreated = hasCaseCreated;
    this.hasEmail = hasEmail;
    this.hasLastIntent = hasLastIntent
    this.caseCreated = caseCreated;
    this.email = email;
  }
}
class CBResultSet {
  constructor(name, age) {
    this.zero = 0;
    this.one = 0;
    this.two = 0;
    this.three = 0;
    this.four = 0;
    this.five = 0;
    this.age = age;
    this.zeroArray = [];
    this.oneArray = [];
    this.twoArray = [];
    this.threeArray = [];
    this.fourArray = [];
    this.fiveArray = [];
    this.filePath = "output.txt";
    this.convIdDataArray = [];
  }

  addToDetailSet(convIDData){
    this.convIdDataArray.push(convIDData);
  }

  addToSet(convId, numberOfElements) {
    if (numberOfElements == 0) {
      this.zero++;
      this.zeroArray.push(convId);
    } else if (numberOfElements == 5) {
      this.five++;
      this.fiveArray.push(convId);
    } else if (numberOfElements == 4) {
      this.four++;
      this.fourArray.push(convId);
    } else if (numberOfElements == 3) {
      this.three++;
      this.threeArray.push(convId);
    } else if (numberOfElements == 2) {
      this.two++;
      this.twoArray.push(convId);
    } else if (numberOfElements == 1) {
      this.one++;
      this.oneArray.push(convId);
    }
  }

  addToOne(convId) {
    this.oneArray.push(convId);
  }
  sayHello() {
    console.log(
      `Hello, my name is ${this.name} and I am ${this.age} years old.`
    );
  }

  writeResult() {
    let contentToWrite = this.highLevelResult();
    let detailResult = this.detailResult();
    contentToWrite = contentToWrite + detailResult;
    fs.writeFile(this.filePath, contentToWrite, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log("Content has been written to the file successfully.");
      }
    });
  }

  detailResult() {
    let contentToWrite = `\nConvId\tHas conveId\tHas userId\tHas caseCreated\tHas email\tHas lastIntent\tcaseCreated\temail length`;
    this.convIdDataArray.forEach((convoIdData) => {
      contentToWrite = contentToWrite + `\n${convoIdData.convId}\t${convoIdData.hasConvId}\t${convoIdData.hasUserId}\t${convoIdData.hasCaseCreated}\t${convoIdData.hasEmail}\t${convoIdData.hasLastIntent}\t${convoIdData.caseCreated}\t${convoIdData.email}`;
    });
    return contentToWrite;
  }

  highLevelResult() {
    let contentToWrite = `Hello, this is some content \t to write to a file!\n`;
    contentToWrite = contentToWrite + "0 Element count " + this.zero + "\n";
    this.zeroArray.forEach((item) => {
      contentToWrite = contentToWrite + "\t" + item + "\n";
    });

    contentToWrite = contentToWrite + "1 Element count " + this.one + "\n";
    this.oneArray.forEach((item) => {
      contentToWrite = contentToWrite + "\t" + item + "\n";
    });

    contentToWrite = contentToWrite + "2 Element count " + this.two + "\n";
    this.twoArray.forEach((item) => {
      contentToWrite = contentToWrite + "\t" + item + "\n";
    });

    contentToWrite = contentToWrite + "3 Element count " + this.three + "\n";
    this.threeArray.forEach((item) => {
      contentToWrite = contentToWrite + "\t" + item + "\n";
    });

    contentToWrite = contentToWrite + "4 Element count " + this.four + "\n";
    this.fourArray.forEach((item) => {
      contentToWrite = contentToWrite + "\t" + item + "\n";
    });

    contentToWrite = contentToWrite + "5 Element count " + this.five + "\n";
    this.fiveArray.forEach((item) => {
      contentToWrite = contentToWrite + "\t" + item + "\n";
    });
    return contentToWrite;
  }
}

const cbResultSet = new CBResultSet("Alice", 30);
// cbResultSet.sayHello();
// cbResultSet.addToOne("sdlfkj");
// cbResultSet.addToOne("sdlfkj2");
// cbResultSet.writeResult();
var zero = (one = two = three = four = five = 0);

// Replace 'your-file.txt' with the path to your file
async function main() {
  const convIdArray = await readFile();
  const resultSet = await processAll(convIdArray);
  cbResultSet.writeResult();
  console.log("triggered after all done " + convIdArray.length);
}

async function processAll(convIdArray){
  const promises = [];

  // Create an array of promises dynamically
  for (const convId of convIdArray) {
    promises.push(fetchData(convId));
  }

  try {
    // Execute all promises concurrently using Promise.all()
    const results = await Promise.all(promises);    
    // console.log('Results:', cbResultSet);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function fetchData(convId) {
  return new Promise((resolve) => {
    var convoId = convId;

    var options = {
      method: "GET",
      url:
        "https://z1.context.liveperson.net/v1/account/88417709/coinbaseIntentWarehouse/" +
        convoId +
        "/properties",
      headers: {
        "maven-api-key": process.env.MAVEN_KEY,
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(convId + " | " + response.body);
      var resultObj = JSON.parse(response.body);
      const numberOfElements = Object.keys(resultObj).length;
      cbResultSet.addToSet(convId, numberOfElements);
      let hasConvId = resultObj.hasOwnProperty("conversationId") ? 'y' : 'n';
      let hasUserId = resultObj.hasOwnProperty("userId") ? 'y' : 'n';
      let hasCaseCreated = resultObj.hasOwnProperty('caseCreated') ? 'y' : 'n';
      let hasEmail = resultObj.hasOwnProperty('email') ? 'y' : 'n';
      let hasLastIntent = resultObj.hasOwnProperty('lastIntent') ? 'y' : 'n';      
      let caseCreated = resultObj.hasOwnProperty('caseCreated') ? resultObj.caseCreated : 'n/a';   
      let email = resultObj.hasOwnProperty('email') ? resultObj.email.length : 'n/a';   
      const convIDData = new ConvIDData(convId, hasConvId, hasUserId, hasCaseCreated, hasEmail, hasLastIntent, caseCreated, email);
      cbResultSet.addToDetailSet(convIDData);
      //processResult(convId, response.body);
      //displayResult();
      resolve(cbResultSet);
    });
  });
}

async function readFile() {
  return new Promise((resolve) => {
    const filePath = "convoid.txt";

    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity, // Detect all possible line endings
    });

    let lines = [];
    rl.on("line", (line) => {
      // Process each line here
      console.log("Line:", line);
      lines.push(line);
      //processLine(line);
    });

    rl.on("close", () => {
      console.log("File reading finished.  " + lines.length);
      resolve(lines);
    });
  });
}

async function fetchUserData(userId) {
  // Simulate fetching user data from an API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: `User ${userId}` });
    }, 1000); // Simulate a delay of 1 second
  });
}

function processLine(convId) {
  // var convoId = '0eb62955-a2dc-4e52-b8a1-f94b294d3a5c';
  var convoId = convId;

  var options = {
    method: "GET",
    url:
      "https://z1.context.liveperson.net/v1/account/88417709/coinbaseIntentWarehouse/" +
      convoId +
      "/properties",
    headers: {
      "maven-api-key": process.env.MAVEN_KEY,
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(convId + " | " + response.body);
    processResult(convId, response.body);
    //displayResult();
  });
}

function displayResult() {
  console.log("zero count " + zero);
  console.log("five count " + five);
}

function processResult(convoId, result) {
  var { numberOfElements, resultObj } = countElements(result);

  cbResultSet.addToSet(convoId, numberOfElements);

  console.log("Number of elements:", numberOfElements);
  if (resultObj.email) {
    console.log("yomama " + convoId);
  } else {
    console.log("no yo mama");
  }
}
function countElements(result) {
  var resultObj = JSON.parse(result);
  const numberOfElements = Object.keys(resultObj).length;

  // checking all the scenarios
  // when case created = true, that means faas sent post to CB, nothing we can do
  // when case created = false, most likely faas filed, need to double check faas log for matching error
  // when no email
  // when no no email nor case created
  // when no ctx data at all
  if (numberOfElements == 0) {
    zero++;
  } else if (numberOfElements == 5) {
    five++;
  } else if (numberOfElements == 4) {
    four++;
  } else if (numberOfElements == 3) {
    three++;
  } else if (numberOfElements == 2) {
    two++;
  } else if (numberOfElements == 1) {
    one++;
  }
  return { numberOfElements, resultObj };
}

main();
