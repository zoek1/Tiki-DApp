import WalletConnect from "@walletconnect/browser";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import Web3 from "web3";
const Box = require('3box');
import { convertUtf8ToHex } from "@walletconnect/utils";


// Create a walletConnector
const walletConnector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org" // Required
});

const web3 = new Web3(window.ethereum);
console.log(web3)
// const NameContract = web3.eth.Contract(contract_abi, contract_address);



// Check if connection is already established
if (!walletConnector.connected) {
  // create new session
  walletConnector.createSession().then(() => {
    // get uri for QR Code modal
    const uri = walletConnector.uri;




    // display QR Code modal
    WalletConnectQRCodeModal.open(uri, () => {
      console.log("QR Code Modal closed");
    });
  });
} else {
  console.log('Conectadp!')
  Box.getProfile(walletConnector.accounts[0], web3.currentProvider).then(function(profile) {
    console.log(profile);
  });

  const message = "My email is john@doe.com - 1537836206101"

  const msgParams = [
    convertUtf8ToHex(message),                                                 // Required
    walletConnector.accounts[0],                             // Required
  ];


// Sign personal message
  walletConnector
    .signPersonalMessage(msgParams)
    .then((result) => {
      // Returns signature.
      console.log(result)
    })
    .catch(error => {
      // Error returned when rejected
      console.error(error);
    })
}

// Subscribe to connection events
walletConnector.on("connect", (error, payload) => {
  if (error) {
    throw error;
  }

  // Close QR Code Modal
  WalletConnectQRCodeModal.close();
  console.log(payload);
  // Get provided accounts and chainId
  const { accounts, chainId } = payload.params[0];
  Box.getProfile(accounts[0], web3.currentProvider).then(function(profile) {
    console.log(profile);
  });


  console.log(accounts);
  console.log(chainId)
});

walletConnector.on("session_update", (error, payload) => {
  if (error) {
    throw error;
  }

  // Get updated accounts and chainId
  const { accounts, chainId } = payload.params[0];
  console.log(accounts);
  console.log(chainId)
});

walletConnector.on("disconnect", (error, payload) => {
  if (error) {
    throw error;
  }
  console.log('Clossing session')
  // Delete walletConnector

  window.location.reload(false);
});



$('#close').on('click', ()=> walletConnector.killSession());


console.log(walletConnector)