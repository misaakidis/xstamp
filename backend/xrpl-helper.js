const { Client, Wallet } = require('xrpl');

// Function to convert a JSON object to a hex string
function jsonToHex(json) {
    return Buffer.from(JSON.stringify(json)).toString('hex');
}

const client = new Client("wss://s.altnet.rippletest.net:51233");
let issuerWallet;
let issuerAddress;

// Initialize the XRP Ledger client and issuer wallet
async function init() {
    if (!client.isConnected()) {
        await client.connect();
    }

    issuerWallet = await generateOrRetrieveWallet();
    issuerAddress = issuerWallet.address;

    console.log(`XStamp issuer wallet address: ${issuerAddress}`);
}

// Get XStamp issuer wallet
async function generateOrRetrieveWallet() {
    const seedEnvVariable = process.env.XRP_SEED;

    if (seedEnvVariable) {
        return Wallet.fromSeed(seedEnvVariable);
    } else {
        const { balance, wallet } = await client.fundWallet();
        return wallet;
    }
}

// Function to get the latest tokenId issued by the issuer wallet
async function getLatestTokenId(tokenTaxon) {
    try {
        const request = {
            command: "account_nfts",
            account: issuerWallet.address
        };

        const response = await client.request(request);

        const nfts = response.result.account_nfts.filter(nft => parseInt(nft.NFTokenTaxon) === tokenTaxon);

        if (nfts.length === 0) {
            return 0; // No NFTs with the given tokenTaxon issued yet, start with tokenId 0
        } else {
            // Extract all tokenIds for the given tokenTaxon and find the maximum
            const tokenIds = nfts.map(nft => parseInt(nft.TokenID));
            return Math.max(...tokenIds) + 1; // Increment the highest tokenId for the next issuance
        }
    } catch (error) {
        console.error('Error fetching latest tokenId:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

// Function to issue a new NFT
async function issueNFT(metadata) {
    try {
        const tokenTaxon = 0;

        const tokenId = await getLatestTokenId(tokenTaxon);

        // Construct NFTokenMint transaction
        const nftMintTx = {
            TransactionType: "NFTokenMint",
            Account: issuerWallet.address,
            NFTokenTaxon: tokenTaxon,
            URI: jsonToHex(JSON.stringify(metadata)),
            TokenID: tokenId
        };

        // Sign the transaction
        const nftMintTxAutofilled = await client.autofill(nftMintTx);
        const signedTx = await issuerWallet.sign(nftMintTxAutofilled);

        // Submit the transaction
        const txResponse = await client.submitAndWait(signedTx.tx_blob);

        console.log(`Digital Stamp issued. Transaction Hash: ${txResponse.result.hash}`);
        return { tx_hash: txResponse.result.hash, issuerAddress: issuerWallet.address, tokenId: tokenId }
    } catch (error) {
        console.error('Error issuing digital stamp:', error);
    }
}

module.exports = {
    init,
    issueNFT,
};