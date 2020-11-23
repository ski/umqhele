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
          ref="remoteVideo"
          id="rempte-video"
          style="background-color: black"
          width="320"
          height="240"
          loop="true"
          controls
          muted
          src="../assets/promo.mp4"
        ></video>
      </div>
      <div class="card-headings">
        <div class="user-block">
          <div class="user-infos">
            <h3>{{ entry.title }}</h3>
            <div class="field is-grouped is-grouped-multiline">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-dark">Minimum Bid</span>
                  <span class="tag is-info">{{ entry.startingBid }} ꟿ</span>
                </div>
              </div>
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-dark">Show Time</span>
                  <span class="tag is-danger">{{ entry.showTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="product-info">
        <div class="post-text">
          <p>
            {{ entry.description }}
          </p>
        </div>
      </div>
      <div class="product-actions">
        <div class="left"></div>
        <div @click="bid" class="right">
          <a class="button is-solid accent-button raised link grow">
            <font-awesome-layers class="fa-2x">
              <font-awesome-icon :icon="['fa', 'gavel']" />
            </font-awesome-layers>
            <span>Bid Now</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'VideoEntry',
  props: {
    entry: Object,
  },
  data() {
    return {      
    };
  },
  methods: {
    async bid() {
      const key = JSON.stringify([new Date(this.entry.showTime).toISOString(), this.entry.title]);
      this.$store.dispatch('wallet/makeBid',this.entry);      
    },
  },

  mounted() {
    this.chance = new Chance();

    // const signalRemote = new IonSDK.IonSFUJSONRPCSignal(
    //   'ws://localhost:7000/ws',
    // );
    // const clientRemote = new IonSDK.Client('umqhele test 1', signalRemote);
    // let remoteStream;
    // clientRemote.ontrack = (track, stream) => {
    //   if (track.kind === 'video') {
    //     remoteStream = stream;
    //     this.$refs.remoteVideo.srcObject = stream;
    //     this.$refs.remoteVideo.autoplay = true;
    //   }
    // };
  },
};
</script>

<style scoped>
.product-info {
  margin-top: 10px;
}
.field {
  margin-top: 10px;
}
</style>