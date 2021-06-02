import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from "./router"
import api from "./lib/api"
import Toaster from "./lib/toaster";

import "./assets/style/reset.scss";
import "./assets/style/grid.scss";
import "./assets/style/global.scss";
import "./assets/style/dark.scss";

Vue.config.productionTip = false;
Vue.use(Toaster);

Vue.mixin({
  methods: {
    isTouchDevice() {
      return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    },
    toggleDarkMode(mode) {
      if (mode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  },
});

api.getAuthorization = () => `Bearer ${store.state.token}`;
api.handleError = (error) => {
  const statusCode = error.response.status;
  if (statusCode === 403) {
    store.commit("logout");
    router.replace({name: "user_blocked"});
  } else if (statusCode === 401) {
    Toaster.toast("请重新登录");
    store.commit("logout");
    router.replace({name: "sign_in", query: {redirect: router.currentRoute.fullPath}});
  } else {
    Toaster.toast.error(error.response.data.error);
  }
};

Vue.prototype.$api = api;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');
