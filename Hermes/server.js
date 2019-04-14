const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const port = 3000;

const httpsConfig = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.crt')
};

// Set public folder as root
app.use(express.static('public'));

// Provide access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// Redirect all traffic to index.html
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

const server = https.createServer(httpsConfig, app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info('listening on %d', port);
});
