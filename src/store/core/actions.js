const actions = {

    log({ commit }, { message }) {
        console.log(
            `%c message: ${message}`,
            "color:black; background-color:#62a1bf; padding:0 5px 0 5px; font-weight:bold;border-radius: 25px;"
        );
    },

    init({ commit }) {
        console.log('initialising....');
    }
}

export default actions;