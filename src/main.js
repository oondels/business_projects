import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import MaterialDashboard from "./material-dashboard";
import router from "./router";
import store from "./store";

// import 'material-icons/iconfont/material-icons.css';
import "material-icons/iconfont/filled.css";
import "material-icons/iconfont/outlined.css";
import "material-icons/iconfont/round.css";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

const appInstance = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
});

appInstance.use(vuetify);
appInstance.use(store);
appInstance.use(router);
appInstance.use(MaterialDashboard);
appInstance.mount("#app");
