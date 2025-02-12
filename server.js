const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app');

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, world! This is an HTTPS-secured Express app.');
});

// SSL options
const options = {
  key: fs.readFileSync(path.join(__dirname, '../key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../cert.pem'))
};

// Create HTTPS server
const port = 5000;
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running on port ${port}`);
});