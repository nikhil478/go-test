const { issuanceService } = require('../service/issuance');

const issuance = async (req, res) => {
    console.log(req.body)
    try {
      const { contractUtxo, issueData, issuerPrivateKey, tokenSchemaTemplate } = req.body;
      const issuanceTxResponse = await issuanceService(contractUtxo, issueData, issuerPrivateKey, tokenSchemaTemplate);
      res.json({ success: true, issuanceTxResponse });
    } catch (error) {
      console.error("An error occurred:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { issuance };