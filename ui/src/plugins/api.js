// @ts-check
import 'regenerator-runtime/runtime';
import { connect } from './connect';

export default {

  connect: async (commit, walletSend) => {
    /**
  * @param {{ type: string; data: any; }} obj
  */
    const apiRecv = (obj) => {
      switch (obj.type) {

        case 'videoTokenizer/createListingResponse': {
          const { updatedOffer } = obj.data;
          walletSend({
            type: 'walletAddOffer',
            data: updatedOffer,
          });
          break;
        }

        case 'videoTokenizer/catalogResponse': {
          const { catalog } = obj.data;  
          console.log('setCatalog',);
          
          const test = catalog.flat();
          console.log('setCatalog',test);
          commit('setCatalog', test);
        }

        case 'CTP_DISCONNECT': {
          // TODO: handle this appropriately
          break;
        }

        default: {
          console.log(obj);
          throw Error(`unexpected apiRecv obj.type ${obj.type}`);
        }
      }
    };

    await connect('/api/videotokenizer', apiRecv).then((rawApiSend) => {
      commit('setApiSend', rawApiSend);
    });
  }
}