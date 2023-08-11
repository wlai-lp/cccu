// utility app to search cb ccs for convos
require('dotenv').config();
var request = require("request");
const readline = require("readline");
const fs = require("fs");

var zero = one = two = three = four = five = 0;

// Replace 'your-file.txt' with the path to your file
const filePath = "convoid.txt";

const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity, // Detect all possible line endings
});

rl.on("line", (line) => {
  // Process each line here
  console.log("Line:", line);
  processLine(line);
});

rl.on("close", () => {
  console.log("File reading finished.");
});

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
    displayResult();
  });
}

function displayResult(){
  console.log("zero count " + zero);
  console.log("five count " + five);
}

function processResult(convoId, result) {
  var { numberOfElements, resultObj } = countElements(result);

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

class CBResultSet {
  constructor(name, age) {
    this.zero = 0;
    this.zero = 0;
    this.zero = 0;
    this.zero = 0;
    this.zero = 0;
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
}