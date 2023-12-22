const axios = require("axios");
const fs = require("fs");

const firstPage = 1;
// const lastPage = 219;
let currentPage = 0;
const bookNumber = 64;
// const lastPage = 194;

let hasError = false;

const pages = [
  "001.jpg.webp",
  "002.jpg.webp",
  "003.jpg.webp",
  "004.jpg.webp",
  "005.jpg.webp",
  "006.jpg.webp",
  "007.jpg.webp",
  "008.jpg.webp",
  "009.jpg.webp",
  "010.jpg.webp",
  "011.jpg.webp",
  "012.jpg.webp",
  "013.jpg.webp",
  "014.jpg.webp",
  "015.jpg.webp",
  "016.jpg.webp",
  "017.jpg.webp",
  "018.jpg.webp",
  "019.jpg.webp",
  "020.jpg.webp",
  "021.jpg.webp",
  "022.jpg.webp",
  "023.jpg.webp",
  "024.jpg.webp",
  "025.jpg.webp",
  "026.jpg.webp",
  "027.jpg.webp",
  "028.jpg.webp",
  "029.jpg.webp",
  "030.jpg.webp",
  "031.jpg.webp",
  "032.jpg.webp",
  "033.jpg.webp",
  "034.jpg.webp",
  "035.jpg.webp",
  "036.jpg.webp",
  "037.jpg.webp",
  "038.jpg.webp",
  "039.jpg.webp",
  "040.jpg.webp",
  "041.jpg.webp",
  "042.jpg.webp",
  "043.jpg.webp",
  "044.jpg.webp",
  "045.jpg.webp",
  "046.jpg.webp",
  "047.jpg.webp",
  "048.jpg.webp",
  "049.jpg.webp",
  "050.jpg.webp",
  "051.jpg.webp",
  "052.jpg.webp",
  "053.jpg.webp",
  "054.jpg.webp",
  "055.jpg.webp",
  "056.jpg.webp",
  "057.jpg.webp",
  "058.jpg.webp",
  "059.jpg.webp",
  "060.jpg.webp",
  "061.jpg.webp",
  "062.jpg.webp",
  "063.jpg.webp",
  "064.jpg.webp",
  "065.jpg.webp",
  "066.jpg.webp",
  "067.jpg.webp",
  "068.jpg.webp",
  "069.jpg.webp",
  "070.jpg.webp",
  "071.jpg.webp",
  "072.jpg.webp",
  "073.jpg.webp",
  "074.jpg.webp",
  "075.jpg.webp",
  "076.jpg.webp",
  "077.jpg.webp",
  "078.jpg.webp",
  "079.jpg.webp",
  "080.jpg.webp",
  "081.jpg.webp",
  "082.jpg.webp",
  "083.jpg.webp",
  "084.jpg.webp",
  "085.jpg.webp",
  "086.jpg.webp",
  "087.jpg.webp",
  "088.jpg.webp",
  "089.jpg.webp",
  "090.jpg.webp",
  "091.jpg.webp",
  "092.jpg.webp",
  "093.jpg.webp",
  "094.jpg.webp",
  "095.jpg.webp",
  "096.jpg.webp",
  "097.jpg.webp",
  "098.jpg.webp",
  "099.jpg.webp",
  "100.jpg.webp",
  "101.jpg.webp",
  "102.jpg.webp",
  "103.jpg.webp",
  "104.jpg.webp",
  "105.jpg.webp",
  "106.jpg.webp",
  "107.jpg.webp",
  "108.jpg.webp",
  "109.jpg.webp",
  "110.jpg.webp",
  "111.jpg.webp",
  "112.jpg.webp",
  "113.jpg.webp",
  "114.jpg.webp",
  "115.jpg.webp",
  "116.jpg.webp",
  "117.jpg.webp",
  "118.jpg.webp",
  "119.jpg.webp",
  "120.jpg.webp",
  "121.jpg.webp",
  "122.jpg.webp",
  "123.jpg.webp",
  "124.jpg.webp",
  "125.jpg.webp",
  "126.jpg.webp",
  "127.jpg.webp",
  "128.jpg.webp",
  "129.jpg.webp",
  "130.jpg.webp",
  "131.jpg.webp",
  "132.jpg.webp",
  "133.jpg.webp",
  "134.jpg.webp",
  "135.jpg.webp",
  "136.jpg.webp",
  "137.jpg.webp",
  "138.jpg.webp",
  "139.jpg.webp",
  "140.jpg.webp",
  "141.jpg.webp",
  "142.jpg.webp",
  "143.jpg.webp",
  "144.jpg.webp",
  "145.jpg.webp",
  "146.jpg.webp",
  "147.jpg.webp",
  "148.jpg.webp",
  "149.jpg.webp",
  "150.jpg.webp",
  "151.jpg.webp",
  "152.jpg.webp",
  "153.jpg.webp",
  "154.jpg.webp",
  "155.jpg.webp",
  "156.jpg.webp",
  "157.jpg.webp",
  "158.jpg.webp",
  "159.jpg.webp",
  "160.jpg.webp",
  "161.jpg.webp",
  "162.jpg.webp",
  "163.jpg.webp",
  "164.jpg.webp",
  "165.jpg.webp",
  "166.jpg.webp",
  "167.jpg.webp",
  "168.jpg.webp",
  "169.jpg.webp",
  "170.jpg.webp",
  "171.jpg.webp",
  "172.jpg.webp"
]


const lastPage = pages.length;

let page = "";
async function getNextPage() {
  
  page = pages[currentPage]
  const outputFilePath = `./files/${bookNumber}-${page}.jpg`;

  // fire
  let _url = `https://eu1.hamreus.com/ps1/h/HFLY/${bookNumber}/${page}`;

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
  if (currentPage < lastPage && !hasError) {
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
