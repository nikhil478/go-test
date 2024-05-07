const { transferService } = require("../service/transfer");

const transfer = async (req, res) => {
    console.log(req.body)
    try {
      const { ownerPrivateKey, stasUtxo, destinationAddress } = req.body;
      const transferTxResponse = await transferService(ownerPrivateKey, stasUtxo, destinationAddress);
      res.json({ success: true, transferTxResponse });
    } catch (error) {
      console.error("An error occurred:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { transfer };