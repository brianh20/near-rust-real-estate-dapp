import * as nearAPI from 'near-api-js';
import bs58 from 'bs58';
import BN from 'bn.js';

export const DEFAULT_FUNCTION_CALL_GAS = new BN('30000000000000');

export async function viewMethodOnContract(nearConfig, method, params) {
  const paramBytes = Buffer.from(params, 'utf8');
  const base58Params = bs58.encode(paramBytes);

  const provider = new nearAPI.providers.JsonRpcProvider(nearConfig.nodeUrl);
  const rawResult = await provider.query(`call/${nearConfig.contractName}/${method}`, base58Params);
  return JSON.parse(rawResult.result.map((x) => String.fromCharCode(x)).join(''));
}