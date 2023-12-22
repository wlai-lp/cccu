const axios = require("axios");
const fs = require("fs");

const firstPage = 1;
// const lastPage = 219;
let currentPage = 1;
const lastPage = 194;
const bookNumber = 105;

let hasError = false;

let page = "";
async function getNextPage() {
  // Replace 'https://example.com/api/data' with your API endpoint
//   const apiUrl = "https://6367ec75edc85dbc84debec0.mockapi.io/api/v1/sde";
  if (currentPage < 10) {
    page = `00${currentPage}`;
  } else if (currentPage >= 10 && currentPage < 100) {
    page = `0${currentPage}`;
  } else {
    page = currentPage;
  }
  const outputFilePath = `./files/${bookNumber}-${page}.jpg`;

  // one piece
  let _url = `https://eu1.hamreus.com/ps1/h/op/vol_${bookNumber}/${page}.jpg.webp`;

  // url: 'https://eu1.hamreus.com/ps1/h/op/vol_100/002.jpg.webp',

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    responseType: "arraybuffer",
    url: _url,
    headers: {
      Referer: "https://tw.manhuagui.com/",
    },
  };

  axios
    .request(config)
    .then((response) => {
      // Write the binary data to a file
      fs.writeFile(outputFilePath, response.data, "binary", (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        } else {
          console.log("Image saved to", outputFilePath);
        }
      });
    })
    .catch((error) => {
      console.log(error);
      hasError = true;
    });
}

async function delayedLoop() {
  // Define the condition for the while loop
  if (currentPage <= lastPage && !hasError) {
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    const delayMilliseconds = randomNumber * 1000;
    console.log('wait ' + delayMilliseconds);
    // get page
    await getNextPage();
    currentPage++;

    // pause for 2 seconds then do it again
    setTimeout(() => {
        delayedLoop();
    }, delayMilliseconds);
    
    // Break the loop if needed
    // if (counter === someCondition) {
    //   break;
    // }
  }

  console.log("Loop finished");
}

// Start the delayed loop
delayedLoop();

// while (currentPage <= lastPage && !hasError) {
//   const randomNumber = Math.floor(Math.random() * 10) + 1;
//   const delayMilliseconds = randomNumber * 1000;
//   setTimeout(getNextPage, delayMilliseconds);
//   currentPage++;
// }
// console.log("Waiting for the timeout to complete...");
