import wallet from '../../plugins/wallet';
import api from '../../plugins/api';

const actions = {

  async connect({ commit, state }) {
    await wallet.connect(commit);
    await api.connect(commit, state.walletSend);    
  },

  async makeSellerOffer({ commit, state }) {
    const offer = {
      id: Date.now(),

      proposalTemplate: {
        want: {
          Items: {
            pursePetname: state.tokenPursePetname,
            value: {
              title: 'Learn to build smart contracts',
              showTime: Date.parse('2020-11-30 14:00:00'),
              auctionEndDate: Date.parse('2020-11-16 14:00:00'),
              reservePrice: 9,
              startingBid: 3,
            }
          },          
        },
        give: {
          Money: {
            pursePetname: state.moolaPursePetname,
            value: 2,
          },
        }
      },
      dappContext: true,
    };

    const apiInvitationRequest = {
      type: 'videoTokenizer/sendInvitation',
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