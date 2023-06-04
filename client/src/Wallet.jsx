import server from "./server";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import {toHex} from 'ethereum-cryptography/utils';



function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const inputPrivateKey = evt.target.value;
    setPrivateKey(inputPrivateKey);
    const publicKey = secp256k1.getPublicKey(inputPrivateKey);
    const address = toHex(publicKey);
    setAddress(address);
    if (address) {
      try {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } catch (ex) {
        alert(ex.response.data.message);
      }
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="type in a private key" value={privateKey} onChange={onChange}></input>
      </label>
      <div>
        Address: {address && address.slice(0, 10)}...
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
