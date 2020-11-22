// @ts-check
import 'regenerator-runtime/runtime';
import dappConstants from '../lib/constants';
import { connect } from './connect';


export default {

  connect: async (commit) => {    
    const {
      INVITE_BRAND_BOARD_ID,
      INSTANCE_BOARD_ID,
      INSTALLATION_BOARD_ID,
      issuerBoardIds: { Auction: AUCTION_ISSUER_BOARD_ID, Money: MONEY_BRAND_BOARD_ID, },
      brandBoardIds: { Auction: AUCTION_BRAND_BOARD_ID, Money: MONEY_ISSUER_BOARD_ID },
    } = dappConstants;

    /**
   * @param {{ type: string; data: any; walletURL: string }} obj
   */
    const walletRecv = (obj) => {
      switch (obj.type) {
        case 'walletDepositFacetIdResponse': {
          //send data to vuex
          commit('setZoeInvitationDepositFacetId', obj.data);
          break;
        }
        case 'walletNeedDappApproval': {
          console.log('wallet needs approvals');
          break;
        }
        case 'walletURL': {
          // TODO: handle appropriately
          break;
        }
        case 'walletUpdatePurses': {
          // We find the first purse that can accept our token.
          const purses = JSON.parse(obj.data);
          
          const tokenPurse = purses.find(
            // Does the purse's brand match our token brand?
            ({ brandBoardId }) => brandBoardId === AUCTION_BRAND_BOARD_ID,
            
          );
          if (tokenPurse && tokenPurse.pursePetname) {
            // If we got a petname for that purse, use it in the offers we create.   
            //send data to vuex                
            commit('setListingPurse', tokenPurse); 
            commit('setTokenPursePetname', tokenPurse.pursePetname);
          }
          commit('setConnected', true);
          break;
        }
        case 'walletSuggestIssuerResponse': {
          break;
        }
        case 'walletSuggestInstallationResponse': {
          break;
        }
        case 'walletSuggestInstanceResponse': {
          break;
        }
        case 'walletOfferAdded': {
          console.log('walletOfferAdded >',obj);
          break;
        }
        case 'walletOfferHandled': {
          console.log('walletOfferHandled >', obj);
          break;
        }
        case 'walletOfferResult': {
          //call into the api here?
          //id: "http://localhost:3000#1606043857082" 
          //if there are different id results, it could be used to key 
          //into the store.
          if(obj.data.outcome) {
            //outcome: "["2020-12-02T23:44:00.000Z","Duprej zel azusun nid."]"
            console.log('outcome is the key ', obj.data.outcome);
          } else {
            console.log('walletOfferResult >', obj);
          }
          
          
          break;
        }
        case 'walletHaveDappApproval': {
          commit('setConnected', true);
          break;
        }
        case 'walletOfferDescriptions' : {
          console.log('walletOfferDescriptions', obj);
        }
        default: {
          throw Error(`unexpected walletRecv obj.type ${obj.type}`);
        }
      }
    };

    // http://localhost:3000#1605891345654
    // http://localhost:3000#1605891345654

    const walletSend = await connect(
      'wallet',
      walletRecv,
      '?suggestedDappPetname=OneVideoAuctions',
    ).then((walletSend) => {
      walletSend({ type: 'walletGetPurses' });
      walletSend({
        type: 'walletGetDepositFacetId',
        brandBoardId: INVITE_BRAND_BOARD_ID,
      });
      walletSend({
        type: 'walletSuggestInstallation',
        petname: 'Installation',
        boardId: INSTALLATION_BOARD_ID,
      });
      walletSend({
        type: 'walletSuggestInstance',
        petname: 'Instance',
        boardId: INSTANCE_BOARD_ID,
      });
      walletSend({
        type: 'walletSuggestIssuer',
        petname: 'Token',
        boardId: AUCTION_ISSUER_BOARD_ID,
      });
      return walletSend;
    });
    commit('setWalletSend', walletSend);
  },

  disconnect: async () => {
    console.log('disconnecting');
  }
}