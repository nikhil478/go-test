const  utility = require('../utility/utility');
const { stasSplit } = require('stas-sdk/index');
const bsv = require('bsv');

const splitService = async (ownerPrivateKey, stasUtxo, splitDestinations) => {
    try {

        ownerPrivateKeyBsv = bsv.PrivateKey.fromString(ownerPrivateKey);

        let splitFee = await stasSplit.feeEstimate(stasUtxo, splitDestinations)

        let tx = await utility.prepareUtxosForFee(splitFee+100);

        if (!tx) {
            throw new Error("Failed to prepare UTXOs for contract.");
        }

        const splitFeeUtxo = utility.getUtxoFromTx(tx, 0);
        
        if (!splitFeeUtxo) {
            throw new Error("Failed to get UTXOs from transaction.");
        }

        const splitHex = await stasSplit.signed(
            ownerPrivateKeyBsv, 
            stasUtxo, 
            splitDestinations, 
            splitFeeUtxo, 
            utility.privateKey
        )

        if (!splitHex) {
            throw new Error("Failed to sign contract.");
        }

        const splitTxResponse = await utility.broadcast(splitHex.toString());
        if (!splitTxResponse) {
            throw new Error("Failed to broadcast contract transaction.");
        }

        return {splitHex: splitHex, txId: splitTxResponse.data};
    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
};

module.exports = { splitService };