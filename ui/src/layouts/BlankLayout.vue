<template>
  <div class="view-wrapper">
    <Navigation @newentry="showNewEntry"></Navigation>
    <router-view></router-view>
    <NewCatalogEntry v-show="isModalVisible" @close="closeModal" />
  </div>
</template>

<script>
import Navigation from "../components/Navigation.vue";
import NewCatalogEntry from "../components/NewCatalogEntry.vue";
export default {
  name: "BlankLayout",
  components: {
    Navigation,
    NewCatalogEntry,
  },
  data() {
    return {
      isModalVisible: false,
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
};
</script>

<style scoped>
.modal {
  display: flex;
}
</style>