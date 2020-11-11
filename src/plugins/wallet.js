import { E } from '@agoric/eventual-send';
import { updateFromNotifier } from '@agoric/notifier';
import { makeCapTPConnection } from '../lib/capt';

export default {
  install: async (app, options) => {
    const store = options.store;
    options.store.dispatch({ type: 'core/log', message: 'wallet initialising' });
    function cmp(a, b) {
      return a < b ? -1 : a === b ? 0 : 1;
    }

    function kv(keyObj, val) {
      const key = Object.values(keyObj)[0];
      const text = Array.isArray(key) ? key.join('.') : key;
      return { ...val, ...keyObj, id: text, text, value: val };;
    }

    const { connected, makeStableForwarder } = makeCapTPConnection();

    const walletP = makeStableForwarder(bootP => E.G(bootP).wallet);
    const boardP = makeStableForwarder(bootP => E.G(bootP).board);
    const scrathc = makeStableForwarder(bootP => E.G(bootP).scratch);

    store.commit('wallet/setConnection', connected);

    //connected.connect(); //it should get a callback to  onOpen in capt

    const contact = await E(walletP).getSelfContact();
    const js = { contactPetname: 'Self', ...kv('Self', contact) }

    // updateFromNotifier({
    //     updateState(state) {
    //         console.log('getInboxJSONNotifier', state);
    //     },
    // }, E(walletP).getInboxJSONNotifier());

    updateFromNotifier({
      updateState(state) {
        store.commit('wallet/setPurses', state);
        console.log('getPursesNotifier', state);
      },
    }, E(walletP).getPursesNotifier());

    // updateFromNotifier({
    //     updateState(state) {
    //         console.log('getDappsNotifier', state);
    //     },
    // }, E(walletP).getDappsNotifier());

    // updateFromNotifier({
    //     updateState(state) {
    //         console.log('getContactsNotifier', state);
    //     },
    // }, E(walletP).getContactsNotifier());

    updateFromNotifier({
      updateState(state) {
        store.commit('wallet/setIssuers', state);
      },
    }, E(walletP).getIssuersNotifier());

  }
}