import Vue from "vue";
import Toast from "../components/Toast";

const ToastConstructor = Vue.extend(Toast);

const Toaster = {
  toast(text, level = "info") {
    const instance = new ToastConstructor({
      data() {
        return {
          text: text,
          level: level
        }
      }
    });
    document.body.appendChild(instance.$mount().$el);
  },

  install(Vue) {
    Vue.prototype.$toast = this.toast;
  }
};

Toaster.toast.error = function (text) {
  return Toaster.toast(text, "error");
};

export default Toaster;
