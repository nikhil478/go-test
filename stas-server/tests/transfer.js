const { contractService } = require("../src/service/contract");
const bsv = require('bsv');
const { issuanceService } = require("../src/service/issuance");
const { transferService } = require("../src/service/transfer");
const { splitService } = require("../src/service/split");

const tokenSchemaTemplate = {
    name: 'Test Token',
    protocolId: 'STAS-20',
    symbol: 'TESTTOKEN001', // REQUIRED
    description: 'This is a test token',
    image: 'Some Image URL',
    totalSupply: 10, // REQUIRED
    decimals: 0,
    satsPerToken: 1, // REQUIRED
    properties: {
      legal: {
        terms: 'STAS, Inc. retains all rights to the token script. Use is subject to terms at https://stastoken.com/license.',
        licenceId: 'stastoken.com',
      },
      issuer: {
        organisation: 'string',
        legalForm: 'string',
        governingLaw: 'string',
        issuerCountry: 'string',
        jurisdiction: 'string',
        email: 'string',
      },
      meta: {
        schemaId: 'STAS1.0',
        website: 'string',
        legal: {
          terms: 'string',
        },
        media: [
          {
            URI: 'string',
            type: 'string',
            altURI: 'string',
          },
        ],
      },
    },
  }

const issuerPrivateKey = "Kz5LtuMhZnGxYuibavAJcNVPY9u86w28NDmjJPRtDBtSjUdjGGwm";
const issuerPrivateKeyBsv = bsv.PrivateKey.fromString(issuerPrivateKey);
const issuanceAddress = bsv.Address.fromPrivateKey(issuerPrivateKeyBsv).toString();
const issueData = [{
    addr: issuanceAddress, // address the token is being issued to
    satoshis: 10, // amount of satoshis of the STAS token the address is receiving
    data: ['STAS TOKEN TESTING'], // token meta data add to the end of the script in OP_RETURN
  }];

const splitDestinations = [
  {address: issuanceAddress, satoshis: 3}, {address: issuanceAddress, satoshis: 7}
];

(async () => {
  try {
    const contractResponse = await contractService(10, tokenSchemaTemplate, issuanceAddress, issuerPrivateKey);
    console.log(contractResponse);
    await new Promise(resolve => setTimeout(resolve, 4000));
    const issuanceResponse = await issuanceService(contractResponse.contractUtxo, issueData , issuerPrivateKey, tokenSchemaTemplate)
    console.log(issuanceResponse)
    await new Promise(resolve => setTimeout(resolve, 10000));
    // const splitTxResponse = await splitService(issuerPrivateKey, issuanceResponse.issuanceUtxo, splitDestinations)
    // console.log(splitTxResponse)
    const transferTxResponse = await transferService(issuerPrivateKey, issuanceResponse.issuanceUtxo,issuanceAddress)
    console.log(transferTxResponse)
} catch (error) {
    console.error("Error:", error);
  }
})();