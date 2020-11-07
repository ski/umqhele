<template>
    <div id="activity-feed" class="view-wrap true-dom">
    <div class="columns">
      <!-- Left side column -->
      <div class="column is-3"></div>

      <!-- /Middle column -->
      <div class="column is-6">
        <Sleeve></Sleeve>
      </div>

      <!-- Right side column -->
      <div class="column is-3">
        
      </div>
    </div>
  </div>
</template>

<script>
import Sleeve from '../components/Sleeve.vue';
export default {
  name: 'Home',  
  components: {
    Sleeve,
  },
};
</script>