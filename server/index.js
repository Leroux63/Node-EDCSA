const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { toHex, bytesToHex } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');

app.use(cors());
app.use(express.json());

const balances = {
  "02d0e0eb7faa7ffaf87e0a633000d9bd726aed6cf7db85b52cf17c75fa9d24f137": 100, // John
  "0286033511b1b22b42c1c16880c0d6cb201b88a0fdb278d157839b219e7f53d58f": 50, // Bryan
  "034be5122cb8ca22d93424e6f042b25bfbceac523afc20281cbceb8c653122be66": 75, // Bella
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { address, recipient, amount, signature, msgHash } = req.body;

  const parsedSignature = {
    r: BigInt(signature.r),
    s: BigInt(signature.s)
  };

  if (!secp256k1.verify(parsedSignature, msgHash, address)) {
    return res.status(400).send({ message: "Invalid transaction" });
  }

  setInitialBalance(address);
  setInitialBalance(recipient);

  if (balances[address] >= amount) {
    balances[address] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[address] });
  } else {
    res.status(400).send({ message: "Not enough funds!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
