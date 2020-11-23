import wallet from '../../plugins/wallet';
import api from '../../plugins/api';
import moment from 'moment';

const moolaPursePetname = 'Fun budget';
const tokenPursePetname = ['OneVideoAuctions', 'Token'];

const actions = {
  async connect({ commit, state }) {
    await wallet.connect(commit, state);
    await api.connect(commit, state.walletSend);
  },

  async makeSellerOffer({ commit, state }, entry) {

    const offer = {
      id: Date.now(),

      proposalTemplate: {
        want: {
          AuctionProceeds: {
            pursePetname: moolaPursePetname,
            value: Number(9), // reserve price
          },
        },
        give: {
          ListingFee: {
            pursePetname: moolaPursePetname,
            value: Number(2),
          },
        },
      },
      dappContext: true,
    };

    console.log(moment().unix());
    console.log(moment().add(5, 'm').unix());
    
    const request = {
      type: 'videoTokenizer/createListing',
      id: Date.now().toLocaleString(),
      data: {
        depositFacetId: state.zoeInvitationDepositFacetId,
        offer,
        entry,
        closesAfter: moment().add(5, 'm').unix(), //5 mins from now
      },
    };
    await state.apiSend(request);
  },

  async getCatalog({ commit, state }) {
    const request = {
      type: 'videoTokenizer/catalog',
      id: Date.now().toLocaleString(),
      data: {},
    };
    await state.apiSend(request);
  },

  async getCatalogItem({ commit, state }, key) {
    const request = {
      type: 'videoTokenizer/getCatalogItem',
      id: Date.now().toLocaleString(),
      data: { entryId: key },
    };
    await state.apiSend(request);
  },

  async getRunningAuctions({ commit, state }, key) {
    const request = {
      type: 'videoTokenizer/getRunningAuctions',
      id: Date.now().toLocaleString(),
      data: { },
    };
    await state.apiSend(request);
  },

  async makeBid({ commit, state }, entry) {   
    const key = entry.uuid;

    const offer = {
      id: Date.now(),

      proposalTemplate: {
        want: {
          Asset: {
            pursePetname: tokenPursePetname,
            value: [entry],
          },
        },
        give: {
          Bid: {
            pursePetname: moolaPursePetname,
            value: Number(42),
          },
        },
      },
      dappContext: true,
    };

    const request = {
      type: 'videoTokenizer/makeBid',
      id: Date.now().toLocaleString(),
      data: {
        offer,
        key,
        depositFacetId: state.zoeInvitationDepositFacetId,
      },
    };
    await state.apiSend(request);
  }
};

export default actions;
