<template>
  <div id="shop-page" class="shop-wrapper">
    <div class="store-sections">
      <div class="container">
        <!--Catalog entries-->
        <div id="products-tab" class="store-tab-pane is-active">
          <div class="columns is-multiline">
            <CatalogEntry @details='showDetails'></CatalogEntry>
            <VideoEntry></VideoEntry>
          </div>
        </div>
      </div>
    </div>
  </div>
  <CatalogEntryDetail v-show="isModalVisible" @close="closeModal" />
</template>

<script>
import Sleeve from "../components/Sleeve.vue";
import CatalogEntry from "../components/CatalogEntry.vue";
import VideoEntry from "../components/VideoEntry.vue";
import CatalogEntryDetail from "../components/CatalogEntryDetail.vue";

export default {
  name: "Home",
  components: {
    Sleeve,
    CatalogEntry,
    VideoEntry,
    CatalogEntryDetail,
  },
  data() {
    return {
      isModalVisible: false,
    };
  },
  methods: {
    showDetails() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    }   
  },
};
</script>
<style scoped>
.modal {
  display: flex;
}
</style>