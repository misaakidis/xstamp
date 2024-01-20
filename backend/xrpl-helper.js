const { Client, Wallet } = require('xrpl');

// Function to convert a JSON object to a hex string
function jsonToHex(json) {
    return Buffer.from(JSON.stringify(json)).toString('hex');
}

// Function to convert a hex string to a JSON object
function hexToString(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
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

        return nfts.length + 1;
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

// Function to fetch and decode the URL of the minted NFT
async function fetchAndDecodeNFTUrl(txHash) {
    try {
        // Fetch the transaction details
        const txDetails = await client.request({
            command: "tx",
            transaction: txHash
        });

        if (txDetails.result.TransactionType !== "NFTokenMint") {
            throw new Error("Transaction is not an NFT Mint transaction");
        }

        // Extract the URI from the transaction details
        const encodedUri = txDetails.result.URI;

        // Decode the URI (assuming it is hex encoded)
        const decodedUri = hexToString(encodedUri);

        // Parse the JSON URI string to an object
        const uriObject = JSON.parse(decodedUri);

        return uriObject;
    } catch (error) {
        console.error('Error fetching or decoding NFT URL:', error);
        throw error;
    }
}

module.exports = {
    init,
    issueNFT,
    fetchAndDecodeNFTUrl
};