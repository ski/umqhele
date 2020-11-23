import wallet from '../../plugins/wallet';
import api from '../../plugins/api';

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

    // TODO: make more robust.
    const currentTime = Math.floor(Date.now() / 1000);
    const hour = 1000 * 60 * 60;

    const request = {
      type: 'videoTokenizer/createListing',
      id: Date.now().toLocaleString(),
      data: {
        depositFacetId: state.zoeInvitationDepositFacetId,
        offer,
        entry,
        closesAfter: currentTime + hour,
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
    console.log('showTime@@==@', entry.showTime);
    const key = entry.uuid;//JSON.stringify([new Date(entry.showTime).toISOString(), entry.title]);

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
