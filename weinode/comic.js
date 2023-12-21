const axios = require('axios');
const fs = require('fs');

// Replace 'https://example.com/api/data' with your API endpoint
const apiUrl = 'https://6367ec75edc85dbc84debec0.mockapi.io/api/v1/sde';
const outputFilePath = 'response.jpg';


let config = {
  method: 'get',
  maxBodyLength: Infinity,
  responseType: 'arraybuffer',
  url: 'https://eu1.hamreus.com/ps1/h/op/vol_100/002.jpg.webp',
  headers: { 
    'Referer': 'https://tw.manhuagui.com/'
  }
};

axios.request(config)
.then(response => {
    // Write the binary data to a file
    fs.writeFile(outputFilePath, response.data, 'binary', (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('Image saved to', outputFilePath);
      }
    });
  })
.catch((error) => {
  console.log(error);
});


