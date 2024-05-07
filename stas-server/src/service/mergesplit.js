const  utility = require('../utility/utility');
const { stasMergeSplit } = require('stas-sdk/index');
const bsv = require('bsv');

const mergeSplitService = async (ownerPrivateKey, stasUtxo1, stasUtxo2, splitDestinations) => {
    try {

        ownerPrivateKeyBsv = bsv.PrivateKey.fromString(ownerPrivateKey);

        let mergeFee = await stasMergeSplit.feeEstimate(stasUtxo1, stasUtxo2, splitDestinations)

        let tx = await utility.prepareUtxosForFee(mergeFee+100);

        if (!tx) {
            throw new Error("Failed to prepare UTXOs for contract.");
        }

        const mergeFeeUtxo = utility.getUtxoFromTx(tx, 0);
        
        if (!mergeFeeUtxo) {
            throw new Error("Failed to get UTXOs from transaction.");
        }

        const mergeSplitHex = await stasMergeSplit.signed(
            ownerPrivateKeyBsv,
            stasUtxo1,
            ownerPrivateKeyBsv,
            stasUtxo2,
            splitDestinations,
            utility.privateKey,
            mergeFeeUtxo,
        )

        if (!mergeSplitHex) {
            throw new Error("Failed to sign contract.");
        }

        const mergeSplitTxResponse = await utility.broadcast(mergeSplitHex.toString());
        if (!mergeSplitTxResponse) {
            throw new Error("Failed to broadcast contract transaction.");
        }

        return {mergeSplitHex: mergeSplitHex, txId: mergeSplitTxResponse.data};
    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
};

module.exports = { mergeSplitService };