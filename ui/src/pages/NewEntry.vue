<template>
  <div id="shop-page" class="shop-wrapper">
    <div class="store-sections">
      <div class="container">
        <!--Catalog entries-->
        <div id="products-tab" class="store-tab-pane is-active">
          <div class="columns">
            <!-- Left side column -->
            <div class="column is-3"></div>

            <!-- /Middle column -->
            <div class="column is-6">
              <div id="compose-card" class="card is-new-content is-highlighted">
                <!-- Top tabs -->
                <div class="tabs-wrapper">
                  <div class="tabs is-boxed is-fullwidth">
                    <ul>
                      <li class="is-active">
                        <a>
                          <span class="icon is-small">
                            <font-awesome-layers class="fa-1x">
                              <font-awesome-icon :icon="['fa', 'pencil-alt']" />
                            </font-awesome-layers>
                          </span>
                          <span>New Entry</span>
                        </a>
                      </li>

                      <!-- Close X button -->
                      <li class="close-wrap">
                        <span class="close-publish" @click="close">
                          <font-awesome-layers class="fa-1x">
                            <font-awesome-icon :icon="['fa', 'times']" />
                          </font-awesome-layers>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <!-- Tab content -->
                  <div class="tab-content">
                    <!-- Compose form -->
                    <div class="compose">
                      <div class="compose-form">
                        <img src="../assets/781.jpg" alt />
                        <div class="control">
                          <textarea
                            id="publish"
                            class="textarea"
                            rows="3"
                            placeholder="Write about the stream you are trading."
                            v-model="description"
                          ></textarea>
                        </div>
                      </div>

                      <div id="options-summary" class="options-summary"></div>

                      <div class="is-suboption">
                        <input
                          class="input"
                          placeholder="Entry Title"
                          v-model="title"
                        />
                      </div>
                    </div>

                    <div class="hidden-options">
                      <div class="target-channels">
                        <div class="channel">
                          <div class="channel-icon">
                            <font-awesome-layers class="fa-1x">
                              <font-awesome-icon :icon="['fa', 'upload']" />
                            </font-awesome-layers>
                          </div>
                          <div class="channel-name">Promo Media</div>
                          <div class="dropdown is-spaced is-modern is-right">
                            <div class="compose-options">
                              <div class="button compose-option">
                                <span>Upload</span>
                                <input type="file" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="channel">
                          <div class="channel-icon">
                            <font-awesome-layers class="fa-1x">
                              <font-awesome-icon :icon="['fa', 'calendar']" />
                            </font-awesome-layers>
                          </div>
                          <div class="channel-name">Showing On</div>
                          <div class="dropdown is-spaced is-modern is-right">
                            <div>
                              <input class="input" v-model="showTime" />
                            </div>
                          </div>
                        </div>

                        <div class="channel">
                          <div class="channel-icon">
                            <font-awesome-layers class="fa-1x">
                              <font-awesome-icon
                                :icon="['fa', 'money-bill-wave-alt']"
                              />
                            </font-awesome-layers>
                          </div>
                          <div class="channel-name">Reserve ꟿ Price</div>
                          <div class="dropdown is-spaced is-modern is-right">
                            <div>
                              <input class="input" v-model="reservePrice" />
                            </div>
                          </div>
                        </div>

                        <div class="channel">
                          <div class="channel-icon">
                            <font-awesome-layers class="fa-1x">
                              <font-awesome-icon
                                :icon="['fa', 'money-bill-wave-alt']"
                              />
                            </font-awesome-layers>
                          </div>
                          <div class="channel-name">Starting ꟿ Bid</div>
                          <div class="dropdown is-spaced is-modern is-right">
                            <div>
                              <input class="input" v-model="minBid" />
                            </div>
                          </div>
                        </div>

                        <div class="channel">
                          <div class="channel-icon">
                            <font-awesome-layers class="fa-1x">
                              <font-awesome-icon :icon="['fa', 'calendar']" />
                            </font-awesome-layers>
                          </div>
                          <div class="channel-name">Auction Duration</div>
                          <div class="dropdown is-spaced is-modern is-right">
                            <div>
                              <input class="input" v-model="duration" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Footer buttons -->
                    <div class="more-wrap">
                      <button
                        type="button"
                        class="button is-solid primary-button is-fullwidth"
                        @click="save"
                      >
                        Save Auction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="column is-3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chance from 'chance';
import moment from 'moment';
import uuid4 from "uuid4";

export default {
  name: 'NewEntry',
  data() {
    return {      
      title: chance.sentence({ words: 4 }),
      description: chance.sentence({ words: 30 }),
      showTime: moment(chance.date({ year: 2020, month: 11 })).format(
        'MM/DD/YYYY hh:mm',
      ),
      minBid: chance.integer({ min: 2, max: 15 }),
      reservePrice: chance.integer({ min: 2, max: 20 }),
      duration: chance.integer({ min: 1, max: 5 }),
    };
  },

  methods: {
    
    async save() {
      const entry = {
        uuid : uuid4(),
        title: this.title,
        description: this.description,
        showTime: this.showTime,
        duration: this.duration,
        reservePrice: this.reservePrice,
        startingBid: this.minBid,
      };
      await this.$store.dispatch("wallet/makeSellerOffer", entry); 
      this.$router.push('/');
    },

    close(){
      this.$router.push('/');
    }
  },
};
</script>

<style scoped>
.compose-options {
  background: unset !important;
}
</style>
