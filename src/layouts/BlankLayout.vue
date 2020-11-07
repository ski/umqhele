<template>
  <div class="view-wrapper">
    <Navigation></Navigation>
      <div id="main-feed" class="container">
        <router-view></router-view>
      </div>
  </div>
</template>

<script>
import Navigation from '../components/Navigation.vue';
export default {
  name: 'BlankLayout',
   components: {
    Navigation,
  },
};

</script>

<style>
</style>