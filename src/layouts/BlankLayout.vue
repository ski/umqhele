<template>
  <div class="view-wrapper">
    <Navigation></Navigation>
    <router-view></router-view>
  </div>
</template>

<script>
import Navigation from "../components/Navigation.vue";
export default {
  name: "BlankLayout",
  components: {
    Navigation,
  },
};
</script>

<style>
</style>