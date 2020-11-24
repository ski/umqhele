<template>
  <div class="view-wrapper">
    <Navigation @newentry="showNewEntry"></Navigation>
    <router-view></router-view>
    <!-- <NewCatalogEntry v-show="isModalVisible" @close="closeModal" /> -->
    <WalletConfirm v-show="showApprovalScreen"></WalletConfirm>
  </div>
</template>

<script>
import Navigation from "../components/Navigation.vue";
import NewCatalogEntry from "../components/NewCatalogEntry.vue";
import WalletConfirm from '../components/WalletConfirm.vue';
import { mapState } from 'vuex';

export default {
  name: "BlankLayout",
  components: {
    Navigation,
    NewCatalogEntry,
    WalletConfirm,
  },
  computed: {
    ...mapState('wallet',['approved']),
  },
  data() {
    return {
      showApprovalScreen: false,
    };
  },
  methods: {
    showNewEntry() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
  },
  watch: {   
    async approved(newValue, oldValue) {
      this.showApprovalScreen = newValue;
    }
  }
};
</script>

<style scoped>
.modal {
  display: flex;
}
</style>