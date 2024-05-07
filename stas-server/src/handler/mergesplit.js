const { mergeSplitService } = require("../service/mergesplit");

const mergeSplit = async (req, res) => {
    try {
      const {ownerPrivateKey, stasUtxo1, stasUtxo2, splitDestinations} = req.body;
      const transferTxResponse = await mergeSplitService(ownerPrivateKey, stasUtxo1, stasUtxo2, splitDestinations);
      res.json({ success: true, transferTxResponse });
    } catch (error) {
      console.error("An error occurred:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { mergeSplit };