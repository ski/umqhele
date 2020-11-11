<template>
  <div class="containers">
    <div v-for="purse in purses" :key="purse.brandBoardId" class="card">
      <div class="sleeve">
        <div class="credit-card selected" style="background: #d0e1f9">
          <div class="card-company">First Bank of Umq</div>
          <div class="card-number">
            <div class="digit-group">{{purse.brandBoardId}}</div>
          </div>
          <div class="card-expire">
            <span class="card-text">Balance:</span>
            {{purse.value}}
            <span class="card-text">{{purse.brandPetname}}</span>
          </div>
          <div class="card-holder">John S. Smith</div>
          <div class="card-type">{{purse.pursePetname}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Sleeve",
  computed: {
    purses() {
      return this.$store.getters["wallet/getPurses"];
    },
  },
};
</script>
<style>
</style>