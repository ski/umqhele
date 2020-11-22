<template>
  <div id="shop-page" class="shop-wrapper">
    <div class="store-sections">
      <div class="container">
        <!--Catalog entries-->
        <div id="products-tab" class="store-tab-pane is-active">
          <div class="columns is-multiline">

            <!-- <CatalogEntry v-for="item in listing" :key='item.showTime' @details='showDetails'></CatalogEntry> -->
            <VideoEntry v-for="item in listing" :key='item.showTime' :entry="item"></VideoEntry>
            <!-- <CatalogEntry @details='showDetails'></CatalogEntry> -->
          </div>
        </div>
      </div>
    </div>    
  </div>  
</template>

<script>
import Sleeve from "../components/Sleeve.vue";
import CatalogEntry from "../components/CatalogEntry.vue";
import VideoEntry from "../components/VideoEntry.vue";
import CatalogEntryDetail from "../components/CatalogEntryDetail.vue";
import { mapState } from 'vuex';

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
  
  computed: {   
    listing() { 
      return this.$store.state.wallet.catalog;
    }
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