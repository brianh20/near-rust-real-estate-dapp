import { viewMethodOnContract, DEFAULT_FUNCTION_CALL_GAS } from '../utils/utils';

export const signIn = (nearConfig, walletConnection) => {
  walletConnection.requestSignIn(
    nearConfig.contractName,
    '', // title. Optional, by the way
    '', // successUrl. Optional, by the way
    '', // failureUrl. Optional, by the way
  );
};

export const signOut = (walletConnection) => {
  walletConnection.signOut();
  window.location.reload();
};

export const getData = async (nearConfig, currentUser) => {
  const allData = (await viewMethodOnContract(nearConfig, 'get_properties', '{}')).map(value => JSON.parse(value));
  const ownData = currentUser && (await viewMethodOnContract(nearConfig, 'get_properties_by_asker', `{"asker": "${currentUser}"}`)).map(value => JSON.parse(value)) || []
  let data = [];

  if (allData) {
    data = allData
      .reverse()
      .map(property => {
        const ownProperty = ownData.find(ownProp => ownProp.id === property.id);
        const ownFunding = ownProperty?.user_funding || null; // to be extended

        return ({
          ...property,
          price: parseFloat(property.price / 100000),
          rent: parseFloat(property.rent / 100000),
          fundingAvailable: parseFloat(property.funding_available / 100000),
          funded: parseFloat(property.funded / 100000),
          userFunding: parseFloat(ownFunding / 100000),
          owned: property.owner === currentUser,
          rented: property.rentor === currentUser
        })
      });
    return data
  } else {
    console.log("Oof, there aren't any secrets.");
  }
  return data;
}

const walletInteraction = async (config, wallet, transaction, args, amount = 0) => {
  try {
    let functionCallResult = await wallet.account().functionCall({
      contractId: config.contractName,
      methodName: transaction,
      args: args,
      gas: DEFAULT_FUNCTION_CALL_GAS, // optional param, by the way
      attachedDeposit: amount,
      walletMeta: '', // optional param, by the way
      walletCallbackUrl: '' // optional param, by the way
    });
    if (functionCallResult && functionCallResult.transaction && functionCallResult.transaction.hash) {
      console.log('Transaction hash for explorer', functionCallResult.transaction.hash)
    }
  } catch (e) {
    console.log('Something went wrong!', e);
  } finally {
    return true;
  }
}

export const createProperty = async (nearConfig, walletConnection, args) => {
  return walletInteraction(nearConfig, walletConnection, 'create_property', args)
}

export const investInProperty = async (nearConfig, walletConnection, { id, amount }) => {
  return walletInteraction(
    nearConfig,
    walletConnection,
    'invest_in_property',
    { id },
    `${Math.round(amount * 100000)}0000000000000000000`
  )
}

export const rollbackInvestment = async (nearConfig, walletConnection, { id }) => {
  return walletInteraction(
    nearConfig,
    walletConnection,
    'rollback_investment',
    { id }
  )
}

export const rentProperty = async (nearConfig, walletConnection, { id, rent }) => {
  return walletInteraction(
    nearConfig,
    walletConnection,
    'rent_property',
    { id },
    `${Math.round(rent * 100000)}0000000000000000000`,
  )
}

export const payRent = async (nearConfig, walletConnection, { id, rent }) => {
  return walletInteraction(
    nearConfig,
    walletConnection,
    'pay_rent',
    { id },
    `${Math.round(rent * 100000)}0000000000000000000`
  )
}

export const distributeRent = async (nearConfig, walletConnection, { id }) => {
  return walletInteraction(
    nearConfig,
    walletConnection,
    'distribute_rent',
    { id }
  )
}

export const finalizeRent = async (nearConfig, walletConnection, { id }) => {
  return walletInteraction(
    nearConfig,
    walletConnection,
    'finalize_rent',
    { id }
  )
}