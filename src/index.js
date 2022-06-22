import React from 'react';
import ReactDOM from 'react-dom';
import * as nearAPI from 'near-api-js';
import App from './app';
import getConfig from './config.js';

async function initRealEstate() {
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');

  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

  // Initializing connection to the NEAR testnet
  const near = await nearAPI.connect({ keyStore, ...nearConfig });

  // Initialize wallet connection
  const walletConnection = new nearAPI.WalletConnection(near);

  // Load in user's account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = walletConnection.getAccountId();
  }

  return { nearConfig, walletConnection, currentUser };
}

initRealEstate()
  .then(({ nearConfig, walletConnection, currentUser }) => {
    ReactDOM.render(
      <App
        nearConfig={nearConfig}
        walletConnection={walletConnection}
        currentUser={currentUser}
      />,
      document.getElementById('root'));
  });

