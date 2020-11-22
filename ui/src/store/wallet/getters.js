const getters = {
  connected: (state, getters, rootState) => state.connected,
  getCatalog: (state) => state.catalog,
  getZoeInvitationDepositFacetId: (state) => state.zoeInvitationDepositFacetId,
  getWalletSend: (state) => state.walletSend,
  getApiSend: (state) =>  state.apiSend,
  getTokenPursePetname: (state) => state.tokenPursePetname,
  getSendInvitationResponse : (state) => state.sendInvitationResponse,
  getListingPurse: (state) => state.listingPurse,
}

export default getters;