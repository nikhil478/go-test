const express = require('express');

const { contract } = require('./src/handler/contract');
const { issuance } = require('./src/handler/issuance');
const { transfer } = require('./src/handler/transfer');
const { split } = require('./src/handler/split');
const { merge } = require('./src/handler/merge');
const { mergeSplit } = require('./src/handler/mergesplit');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!'); 
});

app.post('/contract',contract)
app.post('/issuance',issuance)
app.post('/transfer',transfer)
app.post('/split',split)
app.post('/merge',merge)
app.post('/mergesplit',mergeSplit)

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});