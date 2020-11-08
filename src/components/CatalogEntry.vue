<template>
  <div
    class="column is-one-fifth-fullhd is-one-quarter-widescreen is-one-third-desktop is-one-third-tablet is-half-mobile"
  >
    <div class="product-card">
      <a class="quickview-trigger" @click="showModal"> 
        <font-awesome-layers class="fa-2x">
          <font-awesome-icon :icon="['fa','ellipsis-h']" />
        </font-awesome-layers>
      </a>
      <div class="product-image">
        <img src="../assets/img/products/1.svg" alt />
      </div>
      <div class="product-info">
        <h3>Spring Red Dress</h3>
        <p>A beautiful dress for you best evenings and important dates</p>
      </div>
      <div class="product-actions">
        <div class="left">
          <font-awesome-icon :icon="['fa', 'heart']" />
          <span>18</span>
        </div>
        <div class="right">
          <a class="button is-solid accent-button raised link grow">
            <font-awesome-layers class="fa-2x">
              <font-awesome-icon :icon="['fa', 'gavel']" />
            </font-awesome-layers>
            <span>$27.00</span>
          </a>
        </div>
      </div>
    </div>       
  </div>  
</template>
<script>


export default {
  name: "CatalogEntry",  
  data() {
    return {
      
    };
  },
  methods: {
    showModal() {
        console.log('show');
      this.$emit('details');
    }
  },
};
</script>

