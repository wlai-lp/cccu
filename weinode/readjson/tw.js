const fs = require("fs");
const Table = require("cli-table");
const json2csv = require("json2csv").parse;

// Specify the path to your JSON file
const filePath = "translationwidget.json";

// Read the JSON file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  try {
    // Parse the JSON data
    const jsonData = JSON.parse(data);
    const languageValues = Object.values(jsonData).map(
      (obj) => obj[Object.keys(obj)[0]][0].language
    );

    console.log(languageValues); // Output: ["fr", "en"]
    console.log(languageValues.length); // Output: ["fr", "en"]
    const languageCount = {};
    // Count occurrences of each language
    languageValues.forEach((language) => {
      if (languageCount[language]) {
        // If the language already exists in the count object, increment its count
        languageCount[language]++;
      } else {
        // If the language does not exist in the count object, initialize its count to 1
        languageCount[language] = 1;
      }
    });

    console.log(languageCount); // Output: { fr: 1, en: 2 }
    // console.log(jsonData)
    // const jsonData = jsonData1.questions;

    // // Convert JSON to CSV
    // const csvData = json2csv(jsonData);
    // // Specify the path for the CSV file
    // const csvFilePath = 'output.csv';
    // fs.writeFile(csvFilePath, csvData, (writeErr) => {
    //     if (writeErr) {
    //       console.error('Error writing CSV file:', writeErr);
    //       return;
    //     }
    //     console.log('CSV file has been created successfully:', csvFilePath);
    //   });

    // Create a new table
    // const table = new Table();

    // // Add table headers based on keys of the JSON object
    // const headers = Object.keys(jsonData[0]);
    // table.push(headers);

    // // Add rows to the table
    // jsonData.forEach(item => {
    //   const row = headers.map(header => item[header]);
    //   table.push(row);
    // });

    // // Display the table
    // console.log(table.toString());
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
  }
});
