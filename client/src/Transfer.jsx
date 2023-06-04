import React, { useState } from "react";
import server from "./server";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    if (!address) {
      alert('Wrong wallet!');
      return;
    }

    if (confirm("Sign message")) {
     
      const body = {
        amount: parseInt(sendAmount),
        recipient,
        address,
        privateKey
      };
      const msgHash = hashMessage(body);
      console.log("Message Hash:", msgHash);
      const signature = secp256k1.sign(msgHash, privateKey);
      console.log("Signature:", signature);
      const signedAddress = signature.recoverPublicKey(msgHash).toHex();
      console.log("Recovered Address:", signedAddress);
      try {
        const {
          data: { balance },
        } = await server.post(`send`, {
          ...body,
          signature: {
            r: signature.r.toString(),
            s: signature.s.toString()
          },
          msgHash: msgHash
        });
        setBalance(balance);
      } catch (ex) {
        alert(ex.response.data.message);
      }
    }
  }

  function hashMessage(msg) {
    const hash = keccak256(utf8ToBytes(JSON.stringify(msg)));
    return toHex(hash);
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
