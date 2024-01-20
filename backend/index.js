const express = require('express');
const cors = require('cors');
const xrplh = require('./xrpl-helper');

xrplh.init();

const app = express();
const port = process.env.PORT || 3030;

// Enable CORS for all routes and origins
app.use(cors());

// Middleware for parsing JSON requests
app.use(express.json());

app.post('/issue-stamp', async (req, res) => {
    try {
        const { hash, amount } = req.body; // Extract document hash and amount from request body

        // Check if hash and amount are provided
        if (!hash || !amount) {
            return res.status(400).send({ status: "error", message: "Missing hash or amount" });
        }

        const currentTime = new Date().toISOString(); // Current time in ISO format

        const metadata = {
            hash: hash,
            amount: amount,
            issuedAt: currentTime
        };

        // Issue NFT with the provided metadata
        const nft_details = await xrplh.issueNFT(metadata);

        res.send({ status: "success", tx_hash: nft_details.tx_hash, metadata: metadata, issuerAddress: nft_details.issuerAddress, tokenId: nft_details.tokenId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "error", message: "Internal server error" });
    }
});
  
app.get('/get-stamp', async (req, res) => {
    const txHash = req.query.txhash;

    if (!txHash) {
        return res.status(400).json({ error: "txHash parameter is required" });
    }

    try {
        const nftData = await fetchAndDecodeNFTUrl(txHash);
        res.json(nftData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching or decoding NFT URL" });
    }
});

app.get('/get-stamps', async (req, res) => {
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});