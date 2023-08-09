import { createOrdinal, sendOrdinal, sendUtxos } from 'js-1sat-ord'
import { P2PKHAddress, PrivateKey, Script, Transaction, ChainParams } from "bsv-wasm";

import { DefaultProvider,bsv } from "scrypt-ts";

import * as dotenv from "dotenv";

const satPerByteFee = 0.5;
dotenv.config()


const paymentPk = PrivateKey.from_wif(process.env.PRIVATEKEY_PAYMENT);
const paymentAddress = paymentPk.to_public_key().to_address().set_chain_params(ChainParams.testnet());


const ordPk = PrivateKey.from_wif(process.env.PRIVATEKEY_ORD);
const ordAddress = ordPk.to_public_key().to_address().set_chain_params(ChainParams.testnet());





const provider = new DefaultProvider({
    network: bsv.Networks.testnet
});

await provider.connect();


let utxos = await provider.listUnspent(bsv.Address.fromString(paymentAddress.to_string()))

utxos = utxos.sort((a, b) => b.satoshis - a.satoshis)

const utxo = {
    satoshis: utxos[0].satoshis,
    txid:  utxos[0].txId,
    script: bsv.Script.fromHex(utxos[0].script).toASM(),
    vout: utxos[0].outputIndex,
};


const fireShard = "aGVsbG8gd29ybGQ=";


const ordinalDestinationAddress  = "mqe2d39Yb8UdA6mowX9iWMdcRFYXrNQMje";


// inscription
const inscription =  { dataB64: fireShard,  contentType: "text"}

const tx = await createOrdinal(utxo, ordinalDestinationAddress, paymentPk, paymentAddress.to_string(), satPerByteFee, inscription);

const txid = await provider.sendRawTransaction(tx.to_hex())

console.log('create Ordinal txid', txid)

const paymentUtxo = {
    satoshis: Number(tx.get_output(1)?.get_satoshis()),
    txid:  tx.get_id_hex(),
    script: bsv.Script.fromHex(tx.get_output(1)?.get_script_pub_key_hex()).toASM(),
    vout: 1,
};

const ordinal = {
    satoshis: Number(tx.get_output(0)?.get_satoshis()),
    txid:  tx.get_id_hex(),
    script: bsv.Script.fromHex(tx.get_output(0)?.get_script_pub_key_hex()).toASM(),
    vout: 0,
}

const sendTx = await sendOrdinal(paymentUtxo, ordinal, paymentPk, paymentAddress.to_string(), satPerByteFee, ordPk, ordAddress.to_string() )


const sendTxId = await provider.sendRawTransaction(sendTx.to_hex())

console.log('send Ordinal txid', sendTxId)
