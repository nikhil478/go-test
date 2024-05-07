const { splitService } = require("../service/split");

const split = async (req, res) => {
    console.log(req.body)
    try {
      const { ownerPrivateKey, stasUtxo, splitDestinations } = req.body;
      const splitTxResponse = await splitService(ownerPrivateKey, stasUtxo, splitDestinations);
      res.json({ success: true, splitTxResponse });
    } catch (error) {
      console.error("An error occurred:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { split };