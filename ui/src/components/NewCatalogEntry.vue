<template>
  <div class="modal product-quickview is-large has-light-bg">
    <div class="modal-background quickview-background" @click="close"></div>
    <div class="modal-content">
      <div class="card">
        <div class="container">
          <div class="field">
            <label class="label">Title</label>
            <div class="control">
              <input
                class="input"
                type="text"               
                v-model="title"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Plug</label>
            <div class="control">
              <textarea
                class="textarea"
                placeholder="Plug your stream"
              ></textarea>
            </div>
          </div>

          <div class="field">
            <label class="label">Email</label>
            <div class="control has-icons-left has-icons-right">
              <input
                class="input is-danger"
                type="email"
                placeholder="Email input"
                value="hello@"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-envelope"></i>
              </span>
              <span class="icon is-small is-right">
                <i class="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <p class="help is-danger">This email is invalid</p>
          </div>

          <div class="field">
            <label class="label">Subject</label>
            <div class="control">
              <div class="select">
                <select>
                  <option>Select dropdown</option>
                  <option>With options</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" />
                I agree to the
                <a href="#">terms and conditions</a>
              </label>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <label class="radio">
                <input type="radio" name="question" />
                Yes
              </label>
              <label class="radio">
                <input type="radio" name="question" />
                No
              </label>
            </div>
          </div>

          <div class="field is-grouped">
            <div class="control">
              <button class="button is-link">Submit</button>
            </div>
            <div class="control">
              <button class="button is-text">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewCatalogEntry',
  data(){
    return {
      title: 'hello world'
    }
  },
  computed: {
    itemTitle() {
      return chance.sentence({ words: 4 }) ;
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>
<style scoped>
.container {
  padding: 15px;
}
</style>
