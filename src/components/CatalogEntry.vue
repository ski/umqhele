<template>
  <div class="column is-one-fifth-fullhd is-one-quarter-widescreen is-one-third-desktop is-one-third-tablet is-half-mobile">
    <div class="product-card" data-name="The Bob" data-price="15.00" data-colors="false" data-variants="false">
        <a class="quickview-trigger">
            <i data-feather="more-horizontal"></i>
        </a>
        <div class="product-image">
            <img src="../assets/img/products/5.svg" alt="">
        </div>
        <div class="product-info">
            <h3>The Bob</h3>
            <p>Everyone needs a nice bob to protect himself from the sun</p>
        </div>
        <div class="product-actions">
            <div class="left">
                <font-awesome-icon :icon="['fa', 'heart']" />
                <span>18</span>
            </div>
            <div class="right">                
                <a class="button is-solid accent-button raised">
                    <font-awesome-layers class="fa-2x">
                    <font-awesome-icon :icon="['fa', 'gavel']" />
                    </font-awesome-layers>
                    
                    <span>$15.00</span>
                </a>
            </div>
        </div>
    </div>
</div>
</template>
<script>
export default {
  name: "CatalogEntry",
  methods: {    
  },    
}
</script>
