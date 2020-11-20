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

        case 'videoTokenizer/setupResponse': {
          const { updatedOffer } = obj.data;
          break;
        }

        case 'videoTokenizer/listingsResponse' : {
          const { listing } = obj.data;
          console.log(listing);
          break;
        }
        case 'videoTokenizer/createListingResponse': {
          const { updatedOffer } = obj.data;
          console.log('createListingResponse ', obj);
          walletSend({
            type: 'walletAddOffer',
            data: updatedOffer,
          });
          break;
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