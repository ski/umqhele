const mutations = {

  setConnected(state, data) {    
    state.connected = data;
  },

  setZoeInvitationDepositFacetId(state, data) {
    state.zoeInvitationDepositFacetId = data;
  },

  setWalletSend(state, data) {
    state.walletSend = data;
  },

  setApiSend(state, data) {
    state.apiSend = data;
  },

  setTokenPursePetname(state, data) {
    state.tokenPursePetname = data;
  },

  setSendInvitationResponse(state, data) {
    state.sendInvitationResponse = data;
  },

  setListingPurse(state, data) {
    state.listingPurse = data;
  }
}

export default mutations;