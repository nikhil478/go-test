const { mergeService } = require("../service/merge");

const merge = async (req, res) => {
    console.log(req.body)
    try {
      const {ownerPrivateKey, stasUtxo1, stasUtxo2, destinationAddress} = req.body;
      const transferTxResponse = await mergeService(ownerPrivateKey, stasUtxo1, stasUtxo2, destinationAddress);
      res.json({ success: true, transferTxResponse });
    } catch (error) {
      console.error("An error occurred:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { merge };