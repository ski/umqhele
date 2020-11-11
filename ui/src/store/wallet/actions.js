const actions = {

    connect({ commit, state }) {
        console.log('connect', state.connection.connect());      
         
    },

    disconnect({ commit, state }) {
        console.log('connect', state.connection.disconnect());     
    },
}

export default actions;