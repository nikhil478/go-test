const  utility = require('../utility/utility');
const { stasContract } = require('stas-sdk/index');
const bsv = require('bsv');

const contractService = async (totalSupply, tokenSchemaTemplate, issuerAddress, issuerPrivateKey) => {
    try {
        let contractFee = await stasContract.feeEstimate(tokenSchemaTemplate, totalSupply, true);
        
        let tx = await utility.prepareUtxosForContract(totalSupply, contractFee, issuerAddress);
        if (!tx) {
            throw new Error("Failed to prepare UTXOs for contract.");
        }
        
        const issuerUtxo = utility.getUtxoFromTx(tx, 0);
        const contractFeeUtxo = utility.getUtxoFromTx(tx, 1);
        issuerPrivateKeyBsv = bsv.PrivateKey.fromString(issuerPrivateKey);
        
        if (!issuerUtxo || !contractFeeUtxo) {
            throw new Error("Failed to get UTXOs from transaction.");
        }
        
        contractHex = await stasContract.signed(issuerPrivateKeyBsv, issuerUtxo, contractFeeUtxo, utility.privateKey, tokenSchemaTemplate, totalSupply, true);
        if (!contractHex) {
            throw new Error("Failed to sign contract.");
        }

        const contractTxResponse = await utility.broadcast(contractHex.toString());
        if (!contractTxResponse) {
            throw new Error("Failed to broadcast contract transaction.");
        }

        return {"txID": contractTxResponse.data, "contractUtxo": utility.getUtxoFromTx(contractHex, 0)};
    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
};

module.exports = { contractService };