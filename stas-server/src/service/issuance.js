const  utility = require('../utility/utility');
const { stasIssuance } = require('stas-sdk/index');
const bsv = require('bsv');

const issuanceService = async (contractUtxo, issueData, issuerPrivateKey, tokenSchemaTemplate) => {
    try {
        issuerPrivateKeyBsv = bsv.PrivateKey.fromString(issuerPrivateKey);

        let issuanceFee = await stasIssuance.feeEstimate(issueData, contractUtxo, true,'TESTTOKEN001','STAS-20', true)

        let tx = await utility.prepareUtxosForFee(issuanceFee);

        if (!tx) {
            throw new Error("Failed to prepare UTXOs for contract.");
        }

        const issuanceFeeUtxo = utility.getUtxoFromTx(tx, 0);
        
        if (!issuanceFeeUtxo) {
            throw new Error("Failed to get UTXOs from transaction.");
        }

        const issueHex = await stasIssuance.signed(issuerPrivateKeyBsv, issueData, contractUtxo, issuanceFeeUtxo, utility.privateKey, true, tokenSchemaTemplate.symbol, 'STAS-20', true);
        if (!issueHex) {
            throw new Error("Failed to sign contract.");
        }

        const issuanceTxResponse = await utility.broadcast(issueHex.toString());
        if (!issuanceTxResponse) {
            throw new Error("Failed to broadcast contract transaction.");
        }

        return {"issuanceUtxo": utility.getUtxoFromTx(issueHex, 0), "txId": issuanceTxResponse.data};
    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
};

module.exports = { issuanceService };