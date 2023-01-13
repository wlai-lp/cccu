const fs = require('fs');

const content = 'Some content!';

fs.writeFile('webhooklog.txt', content, err => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});

const http = require('http');
const hostname = '127.0.0.1';
const port = 8282;

const server = http.createServer((req, res) => {
  // write req to log file
  req.on('data', chunk => {
    console.log(`Data chunk available: ${chunk}`)

    // append to log file
    fs.appendFile('webhooklog.txt', chunk, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });


  })
  req.on('end', () => {
    //end of data
  })
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});