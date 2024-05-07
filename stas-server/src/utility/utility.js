const { config } = require("../config/config");
const bsv = require('bsv');
const axios = require('axios');

class Utility {
    constructor() {

        this.privateKey = bsv.PrivateKey.fromString(config.feePayerPrivateKey);
        this.address = bsv.Address.fromPrivateKey(this.privateKey).toString();
        console.log(this.address)
        this.p2pkhOut = bsv.Script.buildPublicKeyHashOut(this.address).toHex();

        this.changeTakerPrivateKey = bsv.PrivateKey.fromString(config.changeTakerPrivateKey),
        this.changeTakerAddress = bsv.Address.fromPrivateKey(this.changeTakerPrivateKey).toString();

    }

    async getAddressUnspentUtxos() {
        try {
            const res = await axios({
                method: 'get',
                url: `https://api.whatsonchain.com/v1/bsv/main/address/${this.address}/unspent`,
            });
            return res.data;
        } catch (error) {
            console.error("Error fetching unspent utxos:", error.message);
            throw new Error("Failed to fetch unspent utxos.");
        }
    }
    
    async getAddressUtxosForAmount(desiredAmount) {
        try {
            const utxos = await this.getAddressUnspentUtxos();
            const formattedUtxos = [];
            let totalAmount = 0;
    
            for (const utxo of utxos) {
                if (totalAmount > desiredAmount) {
                    break;
                }
                const formattedUtxo = {
                    txid: utxo.tx_hash,
                    vout: utxo.tx_pos,
                    satoshis: utxo.value,
                    script: this.p2pkhOut,
                };
                totalAmount += utxo.value;
                formattedUtxos.push(formattedUtxo);
            }
    
            if (desiredAmount > totalAmount) {
                throw new Error("Insufficient Balance !");
            }
            return formattedUtxos;
        } catch (error) {
            console.error("Error preparing utxos for amount:", error.message);
            throw error;
        }
    }

    async prepareUtxosForFee(feeAmount) {
        try {
            const tx = bsv.Transaction();
            tx.feePerKb(50);
    
            const utxos = await this.getAddressUtxosForAmount(feeAmount);
            console.log(utxos)
            tx.from(utxos);
    
            tx.addOutput(new bsv.Transaction.Output({
                script: this.p2pkhOut,
                satoshis: feeAmount,
            }));
    
            tx.change(this.changeTakerAddress);
            tx.sign(this.privateKey);
    
            const response = await this.broadcast(tx.toString());
            console.log('Prepare Utxos Txid: ', response.data);
            return tx;
        } catch (error) {
            console.error("Error preparing utxos for contract:", error.message);
            throw error;
        }
    }
    
    async prepareUtxosForContract(tokenSatoshis, contractFee, issuerAddress) {
        try {
            const tx = bsv.Transaction();
            tx.feePerKb(50);
    
            const utxos = await this.getAddressUtxosForAmount(tokenSatoshis + contractFee);
            tx.from(utxos);
            console.log(utxos)
    
            const issuerP2pkhOut = bsv.Script.buildPublicKeyHashOut(issuerAddress).toHex();
    
            tx.addOutput(new bsv.Transaction.Output({
                script: issuerP2pkhOut,
                satoshis: tokenSatoshis,
            }));
    
            tx.addOutput(new bsv.Transaction.Output({
                script: this.p2pkhOut,
                satoshis: contractFee,
            }));
    
            tx.change(this.changeTakerAddress);
            tx.sign(this.privateKey);
    
            const response = await this.broadcast(tx.toString());
            console.log('Prepare Utxos Txid: ', response.data);
            return tx;
        } catch (error) {
            console.error("Error preparing utxos for contract:", error.message);
            throw error;
        }
    }

      getUtxoFromTx(tx, index) {
        const txObj = bsv.Transaction(tx).toObject();
        return {
          txid: txObj.hash,
          vout: index,
          script: txObj.outputs[index].script,
          satoshis: txObj.outputs[index].satoshis,
        };
 
    }
    
    async broadcast(rawTX) {
        const res = await axios.post(
            'https://api.whatsonchain.com/v1/bsv/main/tx/raw',
            {
              txhex: rawTX,
            },
            {
              headers: {
                'content-type': 'application/json',
              },
            },
        );
        return res;
      }
}

module.exports = new Utility()