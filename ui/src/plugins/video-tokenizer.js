// @ts-check
/* globals document mdc */
import 'regenerator-runtime/runtime';
import dappConstants from '../lib/constants';
import { connect } from './connect';

export default {
  install: async (app, options) => {
    const store = options.store;

    let zoeInvitationDepositFacetId;
    let apiSend;
    let tokenPursePetname = ['OneVideoAuctions', 'Token'];

    const {
      INVITE_BRAND_BOARD_ID,
      INSTANCE_BOARD_ID,
      INSTALLATION_BOARD_ID,
      issuerBoardIds: { Token: TOKEN_ISSUER_BOARD_ID },
      brandBoardIds: { Token: TOKEN_BRAND_BOARD_ID },
    } = dappConstants;

    /**
   * @param {{ type: string; data: any; walletURL: string }} obj
   */
    const walletRecv = (obj) => {
      switch (obj.type) {
        case 'walletDepositFacetIdResponse': {
          console.log('walletDepositFacetIdResponse', obj);
          zoeInvitationDepositFacetId = obj.data;
          break;
        }
        case 'walletNeedDappApproval': {
          console.log('wallet needs approvals');
          break;
        }
        case 'walletURL': {
          console.log('walletURL', obj.data);
          // TODO: handle appropriately
          break;
        }
        case 'walletUpdatePurses': {
          // We find the first purse that can accept our token.
          const purses = JSON.parse(obj.data);
          const tokenPurse = purses.find(
            // Does the purse's brand match our token brand?
            ({ brandBoardId }) => brandBoardId === TOKEN_BRAND_BOARD_ID,
          );
          if (tokenPurse && tokenPurse.pursePetname) {
            // If we got a petname for that purse, use it in the offers we create.
            tokenPursePetname = tokenPurse.pursePetname;
          }
          break;
        }
        case 'walletSuggestIssuerResponse': {
          console.log('walletSuggestIssuerResponse');
          break;
        }
        case 'walletSuggestInstallationResponse': {
          console.log('walletSuggestInstallationResponse');
          break;
        }
        case 'walletSuggestInstanceResponse': {
          console.log('walletSuggestInstanceResponse');
          break;
        }
        case 'walletOfferAdded': {
          console.log('walletOfferAdded');
          break;
        }
        case 'walletOfferHandled': {
          console.log('walletOfferHandled');
          break;
        }
        case 'walletOfferResult': {
          console.log('walletOfferResult');
          break;
        }
        default: {
          throw Error(`unexpected walletRecv obj.type ${obj.type}`);
        }
      }
    };

    const walletSend = await connect(
      'wallet',
      walletRecv,
      '?suggestedDappPetname=OneVideoAuctions',
      // eslint-disable-next-line no-shadow
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
        boardId: TOKEN_ISSUER_BOARD_ID,
      });
      return walletSend;
    });

    /**
   * @param {{ type: string; data: any; }} obj
   */
    const apiRecv = (obj) => {
      switch (obj.type) {
        case 'fungibleFaucet/sendInvitationResponse': {
          // Once the invitation has been sent to the user, we update the
          // offer to include the invitationBoardId. Then we make a
          // request to the user's wallet to send the proposed offer for
          // acceptance/rejection.
          const { offer } = obj.data;
          // eslint-disable-next-line no-use-before-define
          walletSend({
            type: 'walletAddOffer',
            data: offer,
          });
          break;
        }
        case 'CTP_DISCONNECT': {
          // TODO: handle this appropriately
          break;
        }
        default: {
          throw Error(`unexpected apiRecv obj.type ${obj.type}`);
        }
      }
    };

    await connect('/api/videotokenizer', apiRecv).then((rawApiSend) => {
      apiSend = rawApiSend;
      const offer = {
        // JSONable ID for this offer.  This is scoped to the origin.
        id: Date.now().toLocaleString(),

        proposalTemplate: {
          want: {
            Items: {
              title: 'Learn to build smart contracts',
              showTime: Date.parse('2020-11-30 14:00:00'),
              // these don't go in the amountmath, do they?
              auctionEndDate: Date.parse('2020-11-16 14:00:00'),
              reservePrice: 9,
              startingBid: 3,
            },
          },
        },

        // Tell the wallet that we're handling the offer result.
        dappContext: true,
      };
      

      apiSend({
        type: 'videoTokenizer/sendInvitation',
        id: Date.now().toLocaleString(),
        data: {
          depositFacetId: zoeInvitationDepositFacetId,
          offer,
        },
      });
    });
  }
}