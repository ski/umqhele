<template>
  <div id="shop-page" class="shop-wrapper">
      <div class="store-sections">
        <div class="container">
          <!--Catalog entries-->
          <div id="products-tab" class="store-tab-pane is-active">
            <div class="columns is-multiline">
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
              <CatalogEntry></CatalogEntry>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import Sleeve from "../components/Sleeve.vue";
import CatalogEntry from "../components/CatalogEntry.vue";

export default {
  name: "Home",
  components: {
    Sleeve,
    CatalogEntry,
  },
};
</script>