const { contractService } = require("../service/contract");

const contract = async (req, res) => {
    console.log(req.body)
    try {
      const { totalSupply, tokenSchemaTemplate, issuerAddress, issuerPrivateKey } = req.body;
      const contractTxResponse = await contractService(totalSupply, tokenSchemaTemplate, issuerAddress, issuerPrivateKey);
      res.json({ success: true, contractTxResponse });
    } catch (error) {
      console.error("An error occurred:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { contract };