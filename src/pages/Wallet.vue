<template>
  <div id="activity-feed" class="view-wrap true-dom">
    <div class="columns">
      <!-- Left side column -->
      <div class="column is-3"></div>

      <!-- /Middle column -->
      <div class="column is-6">
        <Sleeve></Sleeve>
      </div>

      <!-- Right side column -->
      <div class="column is-3">
        
      </div>
    </div>
  </div>
  <div>
    <button class="button is-primary" @click.prevent="toggleConnection">Connect</button>
  </div>
</template>

<script>
import Purse from '../components/Purse.vue';
import Sleeve from '../components/Sleeve.vue';
export default {
  name: 'Wallet',
  components: {
    Purse,
    Sleeve,
  },
  methods: {
    async toggleConnection() {
      await this.$store.dispatch('wallet/connect');
      //console.log(this.$store);
      console.log(this.$store.getters["wallet/getPurses"]);
    },
  },
};
</script>