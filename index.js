const express = require('express');
const xrplh = require('./xrpl-helper');

xrplh.init();

const app = express();
const port = process.env.PORT || 3030;

// Middleware for parsing JSON requests
app.use(express.json());

app.post('/issue-stamp', async (req, res) => {
    const tokenId = 'unique_token_id'; // Unique identifier for the NFT
    const metadata = { "test": "test" };
    xrplh.issueNFT(metadata);
    res.send({ "status": "success" });
});
  
app.post('/validate-stamp', async (req, res) => {
});

app.get('/get-stamps', async (req, res) => {
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});