import wallet from '../../plugins/wallet';
import api from '../../plugins/api';

const moolaPursePetname = 'Fun budget';

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

    const apiInvitationRequest = {
      type: 'videoTokenizer/createListing',
      id: Date.now().toLocaleString(),
      data: {
        depositFacetId: state.zoeInvitationDepositFacetId,
        offer,
        entry,
        closesAfter: currentTime + hour,
      },
    };
    await state.apiSend(apiInvitationRequest);
  },
};

export default actions;
