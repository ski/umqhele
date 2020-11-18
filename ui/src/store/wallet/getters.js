const getters = {

  connected: (state, getters, rootState) => {
  },

  getIssuers: (state, getters, rootState) => {
    return state.issuers;
  },

  getPurses: (state) => {
    return state.purses;
  },

  getZoeInvitationDepositFacetId: (state) => {
    return state.zoeInvitationDepositFacetId;
  },

  getWalletSend: (state) => {
    return state.walletSend;
  },

  getApiSend: (state) => {
    return state.apiSend;
  },

  getTokenPursePetname(state){
    return state.tokenPursePetname;
  },

  getSendInvitationResponse(state){
    return state.sendInvitationResponse;
  }
}

export default getters;