// @ts-check
/* globals document */
import { rpc } from '../lib/socket';
import { activateSocket as startApi } from '../lib/api-client';
import { activateSocket as startBridge } from '../lib/wallet-client';

/**
 * @param {string} endpointPath
 * @param {(obj: { type: string, data: any }) => void} recv
 * @param {string} [query='']
 */
export const connect = (endpointPath, recv, query = '') => {

  const endpoint =
    endpointPath === 'wallet' ? `/private/wallet-bridge${query}` : endpointPath;

  /**
   * @param {{ type: string, data: any}} obj
   */
  const send = (obj) => {
    console.log(`${endpointPath}>`, obj);
    return rpc(obj, endpoint);
  };

  /**
   * @type {(value?: any) => void}
   */
  let resolve;
  /**
   * @type {(reason?: any) => void}
   */
  let reject;
  const sendP = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const activator = endpointPath === 'wallet' ? startBridge : startApi;
  activator(
    {
      onConnect() {
        //$status.innerHTML = 'Connected';
        resolve(send);
      },
      /** @param {Record<string, unknown>} obj */
      onMessage(obj) {
        if (!obj || typeof obj.type !== 'string') {
          return;
        }
        const displayObj = { ...obj };
        if (obj.type === 'walletUpdatePurses' && typeof obj.data === 'string') {
          // This returns JSON for now.
          displayObj.data = JSON.parse(obj.data);
        }

        console.log(`${endpointPath}<`, obj);
        recv(obj);
      },
      onDisconnect() {
        reject();
      },
    },
    endpoint,
  );

  return sendP;
};
