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
      </div>
      <div class="navbar-menu">
        <div class="navbar-start"></div>
        <div class="navbar-end">
          <div class="navbar-item is-icon drop-trigger has-caret">
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
export default {
  name: "Navigation",
  methods: {
    async connect() {
      await this.$store.dispatch("wallet/connect");
    },

    async newEntry() {
      await this.$store.dispatch("wallet/makeSellerOffer");
      //this.$router.push('new')      
    },
  },
};
</script>

<style>
</style>