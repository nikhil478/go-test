const  utility = require('../utility/utility');
const { stasTransfer } = require('stas-sdk/index');
const bsv = require('bsv');

const transferService = async (ownerPrivateKey, stasUtxo, destinationAddress) => {
    try {

        const ownerPrivateKeyBsv = bsv.PrivateKey.fromString(ownerPrivateKey);

        let transferFee = await stasTransfer.feeEstimate(stasUtxo)

        let tx = await utility.prepareUtxosForFee(transferFee+100);

        if (!tx) {
            throw new Error("Failed to prepare UTXOs for contract.");
        }

        const transferFeeUtxo = utility.getUtxoFromTx(tx, 0);
        
        if (!transferFeeUtxo) {
            throw new Error("Failed to get UTXOs from transaction.");
        }

        destinationAddressBsv = bsv.Address.fromString(destinationAddress).toString()

        const transferHex = await stasTransfer.signed(
            ownerPrivateKeyBsv, 
            stasUtxo, 
            destinationAddressBsv, 
            transferFeeUtxo, 
            utility.privateKey
        )

        if (!transferHex) {
            throw new Error("Failed to sign contract.");
        }

        const transferTxResponse = await utility.broadcast(transferHex.toString());
        if (!transferTxResponse) {
            throw new Error("Failed to broadcast contract transaction.");
        }

        return {transferHex: transferHex, txId: transferTxResponse.data};
    } catch (error) {
        console.error("An error occurred:", error.message);
        throw error;
    }
};

module.exports = { transferService };