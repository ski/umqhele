<template>
  <div class="modal product-quickview is-large has-light-bg">
    <div class="modal-background quickview-background" @click="close"></div>
    <div class="modal-content">
      <div class="card">
        <div class="quickview-loader">
          <div class="loader is-loading"></div>
        </div>
        <div class="left">
          <div class="product-image is-active">
            <img src="../assets/img/products/1.svg" alt />
          </div>
        </div>
        <div class="right">
          <div class="header">
            <div class="product-info">
              <h3 id="quickview-name">Spring Red Dress</h3>
              <p>A beautiful dress for you best evenings and important dates</p>
            </div>
            <div id="quickview-price" class="price">27.00</div>
          </div>

          <!--Description-->
          <div class="quickview-description content has-slimscroll">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.Scrupulum, inquam, abeunti; Ubi ut eam
              caperet aut quando? Erat enim
              Polemonis. Utram tandem linguam nescio? Duo Reges: constructio interrete.
            </p>

            <p>
              Alio modo Non est igitur voluptas bonum. Estne, quaeso, inquam, sitienti in bibendo
              voluptas? Erat enim Polemonis. Minime vero,
              inquit ille, consentit. Hic ambiguo ludimur. Numquam facies. Ea possunt paria non esse.
            </p>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scrupulum, inquam, abeunti; Ubi ut eam
              caperet aut quando? Erat enim
              Polemonis. Utram tandem linguam nescio? Duo Reges: constructio interrete.
            </p>
          </div>

          <div class="quickview-controls">
            <div class="spinner">
              <button class="remove">
                <i data-feather="minus"></i>
              </button>

              <button class="add">
                <i data-feather="plus"></i>
              </button>
              <input class="spinner-input" type="hidden" value="1" />
            </div>
            <a class="button is-solid accent-button raised">
              <span>Place Bid</span>
              <var id="quickview-button-price">27.00</var>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "CatalogEntryDetail",
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>