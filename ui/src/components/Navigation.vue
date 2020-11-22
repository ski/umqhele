<template>
  <nav
    id="main-navbar"
    role="navigation"
    aria-label="main navigation"
    class="navbar is-inline-flex is-transparent no-shadow is-hidden-mobile"
  >
    <div class="container is-fluid">
      <div class="navbar-brand">
        <div class="navbar-item is-icon has-caret">
          <font-awesome-layers class="fa-2x pv3 ph2 ma0 grow drop-nav-icon">
            <font-awesome-icon :icon="['fa', 'globe-africa']" />
          </font-awesome-layers>
        </div>
        <h3 class="has-text-centered">UMQHELE</h3>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start"></div>
        <div class="navbar-end" >         
          <div class="navbar-item is-icon drop-trigger has-caret" v-if="connected">
            <font-awesome-layers
              @click="newEntry"
              class="fa-2x pv3 ph2 ma0 link grow nav-is-active"
            >
              <font-awesome-icon :icon="['fa', 'plus']" />
            </font-awesome-layers>
          </div>
          <div class="navbar-item is-icon drop-trigger has-caret">
            <font-awesome-layers
              @click.prevent="connect"
              class="fa-2x pv3 ph2 ma0 link grow nav-is-active"
            >
              <font-awesome-icon :icon="['fa', 'power-off']" />
            </font-awesome-layers>
          </div>
          <span class="mr5"></span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Navigation',
  computed: {
    ...mapState('wallet',['connected'])
  },
  methods: {
    async connect() {
      await this.$store.dispatch('wallet/connect');
    },

    async newEntry() {
      this.$router.push('new');
    },
  },
  watch: {
    //connection state shas changed.
    async connected(newValue, oldValue) {
      if(newValue) {
        await this.$store.dispatch('wallet/getCatalog'); 
      }
    }
  },
  mounted() {    
  },
};
</script>

<style>
h3.has-text-centered {
	display: inline;
	position: relative;
	font: 25px Helvetica, Sans-Serif;
	letter-spacing: 3px;
	color: rgba(0,0,255,0.5); 
  padding-top: 16px;
}

h3.has-text-centered:after {
	content: "UMQHELE";
	position: absolute; left: 2px; top: 2px;
	color: rgba(255,0,0,0.5); 
  padding-top: 16px;  
}

</style>