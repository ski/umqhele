import { makeCapTP, E } from '@agoric/captp';
import { makePromiseKit } from '@agoric/promise-kit';
import { makeWebSocket } from './endpoint';

export function makeCapTPConnection(/*makeConnection, { onReset }*/) {
  console.log('makeCapTPConnection');
  let bootPK = makePromiseKit();
  let dispatch;
  let abort;

  function onClose(event) {
    console.log('connection closed', event);
  }

  async function onOpen(event) {
    const { abort: ctpAbort, dispatch: ctpDispatch, getBootstrap } = makeCapTP('@agoric/dapp-svelte-wallet-ui', sendMessage);
    abort = ctpAbort;
    dispatch = ctpDispatch;

    // Wait for the other side to finish loading.
    await E.G(getBootstrap()).LOADING;

    // Begin the flow of messages to our wallet, which
    // we refetch from the new, loaded, bootstrap promise.
    bootPK.resolve(getBootstrap());

  }

  function onMessage(event) {
    if (event.data) {
      const obj = JSON.parse(event.data);
      console.log('onMessage');
      //this is a call back to wallet.
      dispatch(obj);
    }

  }

  const endpoint = 'ws://127.0.0.1:8000/private/captp?accessToken=zYd7mBI7EUHf0b8gzCdIiIQu7cL5w0DncRVZU0F8jJo9lki94j_WPapukEfDAfIz';
  const props = makeWebSocket(endpoint, { onOpen, onMessage, onClose })
  const { sendMessage } = props;

  function makeStableForwarder(fromBootP = x => x) {
    //console.log(E.G(fromBootP(bootPK.promise)));
    return new HandledPromise((_resolve, _reject, resolveWithPresence) => {
      resolveWithPresence({
        applyMethod(_p, name, args) {
          return E(fromBootP(bootPK.promise))[name](...args);
        },
        get(_p, name) {
          return E(fromBootP(bootPK.promise))[name];
        },
      });
    });
  }

  return { makeStableForwarder, ...props };
};