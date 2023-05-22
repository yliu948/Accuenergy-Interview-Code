import Vue from "vue";
import App from "./App.vue";
import * as VueGoogleMaps from "vue2-google-maps";

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyAJ9eeAPMQM1iO2UO32ATz-7T9DLDVU1L4",
    libraries: "places",
  },
});

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
