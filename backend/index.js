const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const xrpl = require('xrpl');
await client.connect();

// Middleware for parsing JSON requests
app.use(express.json());

app.post('/issue-stamp', async (req, res) => {
});
  
app.post('/validate-stamp', async (req, res) => {
});

app.get('/get-stamps', async (req, res) => {
});

const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});