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
      <div class="product-info">
        <h3>Drone Photography Event</h3>
        <p>Specialist Drone Training Courses aimed at more experienced DJI Drone pilots who want to take their flying skills and aerial photography to the next level.</p>
      </div>
      <div class="product-actions">
        <div class="left">
          <font-awesome-icon :icon="['fa', 'heart']" />
          <span>18</span>
        </div>
        <div class="right">
          <a class="button is-solid accent-button raised link grow">
            <font-awesome-layers class="fa-2x">
              <font-awesome-icon :icon="['fa', 'sign-in-alt']" />
            </font-awesome-layers>
            <span>Join</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "VideoEntry",
  data() {
    return {};
  },
  methods: {
    showModal() {
      console.log("show");
      this.$emit("details");
    },
  },

  mounted() {
    const signalRemote = new IonSDK.IonSFUJSONRPCSignal(
      "ws://localhost:7000/ws"
    );
    const clientRemote = new IonSDK.Client("umqhele test 1", signalRemote);
    let remoteStream;
    clientRemote.ontrack = (track, stream) => {
      if (track.kind === "video") {
        remoteStream = stream;
        this.$refs.remoteVideo.srcObject = stream;
        this.$refs.remoteVideo.autoplay = true;
      }
    };
  },
};
</script>

