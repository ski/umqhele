const mutations = {
    setConnection(state, data) {
        state.connection = data;
    },

    setInbox(state, data){
        state.inbox = data;
    },

    setIssuers(state, data){
        state.issuers = data;
    },

    setPurses(state, data){
        console.log(data[2]);
        state.purses = data;
    }
}

export default mutations;