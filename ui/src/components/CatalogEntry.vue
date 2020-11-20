<template>
  <div
    class="column is-one-fifth-fullhd is-one-quarter-widescreen is-one-third-desktop is-one-third-tablet is-half-mobile"
  >
    <div class="product-card is-post card">
      <a class="quickview-trigger" @click="showModal">
        <font-awesome-layers class="fa-2x">
          <font-awesome-icon :icon="['fa', 'ellipsis-h']" />
        </font-awesome-layers>
      </a>
      <div class="product-image">
        <video
          id="local-video"
          style="background-color: black"
          width="320"
          height="240"
          loop="true"
          autoplay="autoplay"
          controls
          muted
          src="../assets/promo.mp4"
        ></video>
      </div>
      <div class="card-headings">
        <div class="user-block">         
          <div class="user-infos">
            <h3>Drone Photography</h3>
            <span class="time">Minimum Bid 9mool</span>
            <span class="time">Show Time 9mool</span>
          </div>
        </div>
      </div>
      <div class="user-info product-info">
        
        <div class='post-text'>
        <p>
          Specialist Drone Training Courses aimed at more experienced DJI Drone
          pilots who want to take their flying skills and aerial photography to
          the next level.
        </p>
        </div>
      </div>
      <div class="product-actions">
        <div class="left"></div>
        <div class="right">
          <a
            class="button is-solid accent-button raised link grow"
            @click="listEntry"
          >
            <font-awesome-layers class="fa-2x">
              <font-awesome-icon :icon="['fa', 'gavel']" />
            </font-awesome-layers>
            <span>Post</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CatalogEntry',
  data() {
    return {};
  },
  methods: {
    showModal() {
      this.$emit('details');
    },

    async listEntry() {
      await this.$store.dispatch('wallet/getListing');
    },

    start() {
      const signalLocal = new IonSDK.IonSFUJSONRPCSignal(
        'ws://localhost:7000/ws',
      );
      const clientLocal = new IonSDK.Client('umqhele test 1', signalLocal);

      let localStream;
      IonSDK.LocalStream.getUserMedia({
        resolution: 'hd',
        simulcast: false,
        audio: true,
      })
        .then((media) => {
          clientLocal.publish(media);
        })
        .catch(console.error);
    },
  },

  mounted() {},
};
</script>

