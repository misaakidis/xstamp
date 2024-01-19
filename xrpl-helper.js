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

// Function to issue a new NFT
async function issueNFT(metadata) {
    try {
        const tokenTaxon = 0;

        // Construct NFTokenMint transaction
        const nftMintTx = {
            TransactionType: "NFTokenMint",
            Account: issuerWallet.address,
            NFTokenTaxon: tokenTaxon,
            URI: jsonToHex(JSON.stringify(metadata))
        };

        // Sign the transaction
        const nftMintTxAutofilled = await client.autofill(nftMintTx);
        const signedTx = await issuerWallet.sign(nftMintTxAutofilled);

        // Submit the transaction
        const txResponse = await client.submitAndWait(signedTx.tx_blob);

        console.log(`Digital Stamp issued. Transaction Hash: ${txResponse.result.hash}`);
    } catch (error) {
        console.error('Error issuing digital stamp:', error);
    }
}

module.exports = {
    init,
    issueNFT,
};