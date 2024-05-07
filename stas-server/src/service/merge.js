const  utility = require('../utility/utility');
const { stasMerge } = require('stas-sdk/index');
const bsv = require('bsv');

const mergeService = async (ownerPrivateKey, stasUtxo1, stasUtxo2, destinationAddress) => {
    try {

        ownerPrivateKeyBsv = bsv.PrivateKey.fromString(ownerPrivateKey);

        let mergeFee = await stasMerge.feeEstimate(stasUtxo1, stasUtxo2)

        let tx = await utility.prepareUtxosForFee(mergeFee+100);

        if (!tx) {
            throw new Error("Failed to prepare UTXOs for contract.");
        }

        const mergeFeeUtxo = utility.getUtxoFromTx(tx, 0);
        
        if (!mergeFeeUtxo) {
            throw new Error("Failed to get UTXOs from transaction.");
        }

        console.log(
            stasUtxo1,
            stasUtxo2,
            destinationAddress,
            mergeFeeUtxo,
        )

        const mergeHex = await stasMerge.signed(
            ownerPrivateKeyBsv,
            stasUtxo1,
            ownerPrivateKeyBsv,
            stasUtxo2,
            destinationAddress,
            utility.privateKey,
            mergeFeeUtxo,
        )

        if (!mergeHex) {
            throw new Error("Failed to sign contract.");
        }

        const mergeTxResponse = await utility.broadcast(mergeHex.toString());
        if (!mergeTxResponse) {
            throw new Error("Failed to broadcast contract transaction.");
        }

        return {mergeUtxo: utility.getUtxoFromTx(mergeHex, 0), txId: mergeTxResponse.data};
    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
};

module.exports = { mergeService };