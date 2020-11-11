const getters = {
    
    connected: (state, getters, rootState) => {
    },

    getIssuers: (state, getters, rootState) => {
        return state.issuers;
    },
    getPurses:(state) => {
        return state.purses;
    }
}

export default getters;