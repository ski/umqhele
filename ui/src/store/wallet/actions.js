import wallet from '../../plugins/wallet';
import api from '../../plugins/api';
import { setupMint } from './mint';

const moolaPursePetname = 'Fun budget';
const tokenPursePetname = ['OneVideoAuctions', 'Token']

const actions = {

  async connect({ commit, state }) {
    await wallet.connect(commit);
    await api.connect(commit, state.walletSend);
  },

  async makeSellerOffer({ commit, state }, entry) {

    await setupMint(state);

    const offer = {
      id: Date.now(),

      proposalTemplate: {
        want: {
          Items: {
            pursePetname: tokenPursePetname,
            value: [entry]
          },
        },
        give: {
          Money: {
            pursePetname: moolaPursePetname,
            value: Number(2),
          },
        }
      },
      dappContext: true,
    };

    const apiInvitationRequest = {
      type: 'videoTokenizer/createListing',
      id: Date.now().toLocaleString(),
      data: {
        depositFacetId: state.zoeInvitationDepositFacetId,
        offer,
      },
    }
    await state.apiSend(apiInvitationRequest);
  },

  async publishAuction({ commit, state }, item) {
    const template = {
      want: {
        Ask: {
          pursePetname: moolaPursePetname,
          value: Number(9)
        }
      },
      give: {
        Asset: {
          pursePetname: tokenPursePetname,
          value: [item]
        }
      },
      exit: {
        waived: null
      }
    }
    const offer = {
      id: Date.now(),
      proposalTemplate: template,
      dappContext: true,
    }

    const apiInvitationRequest = {
      type: 'videoTokenizer/publishAuction',
      id: Date.now().toLocaleString(),
      data: {
        depositFacetId: state.zoeInvitationDepositFacetId,
        offer,
      },
    }
    await state.apiSend(apiInvitationRequest);
  },

  async getListing({ commit, state }) {
    const apiListingRequest = {
      type: 'videoTokenizer/listings',
      id: Date.now().toLocaleString(),
    }
    await state.apiSend(apiListingRequest);
  },

  async test({ commit, state }) {
    state.walletSend({
      type: 'walletGetOffers',
    });
  }
}

export default actions;