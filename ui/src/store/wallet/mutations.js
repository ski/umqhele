import Vuex from 'vuex';

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
  },

  setCatalog(state, data) {
    state.catalog = [...state.catalog,  ...data ]
    console.log('catalog',state.catalog);
    //Vue.set(state, 'catalog', ...data);
  },

  addCatalogEntry(state, data) {
    state.catalog = [...state.catalog, { data }]
  }
}

export default mutations;