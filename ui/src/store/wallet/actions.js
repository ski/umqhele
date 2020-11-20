import wallet from '../../plugins/wallet';
import api from '../../plugins/api';
const moolaPursePetname = 'Fun budget';
const tokenPursePetname = ['OneVideoAuctions', 'Token']

const actions = {

  async connect({ commit, state }) {
    await wallet.connect(commit);
    await api.connect(commit, state.walletSend);
  },

  async init({ commit, state }) {
    const offer = {
      id: Date.now(),

      proposalTemplate: {
        want: {
        }
      },
      dappContext: true,
    };

    const apiSendRequest = {
      type: 'videoTokenizer/setup',
      id: Date.now().toLocaleString(),
      data: {
        depositFacetId: state.zoeInvitationDepositFacetId,
        offer,
      },
    }
    await state.apiSend(apiSendRequest);
  },

  async getListing({ commit, state }) {
    const apiListingRequest = {
      type: 'videoTokenizer/listings',
      id: Date.now().toLocaleString(),     
    }
    await state.apiSend(apiListingRequest);
  },
  
  async makeSellerOffer({ commit, state}, entry ) {        
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
  }
}

export default actions;