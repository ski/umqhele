import { createStore } from 'vuex'
import core from './core'
import wallet from './wallet';

export default createStore({
  modules: {
    core,
    wallet,
  }
})
