import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    token: null,
    darkMode: false,
    roomPasswords: {}
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setToken(state, token) {
      state.token = token;
    },
    setDarkMode(state, mode) {
      state.darkMode = mode;
    },
    setNickName(state, payload) {
      let user = state.user;
      user.name = payload.name;
      if (payload.avatarUrl) {
        user.avatar_url = payload.avatarUrl;
      }
      if (payload.thumbAvatarUrl) {
        user.thumb_avatar_url = payload.thumbAvatarUrl;
      }
      state.user = user;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
    setRoomPassword(state, payload) {
      Vue.set(state.roomPasswords, payload.roomId, payload.password);
    }
  },
  plugins: [createPersistedState({key: "app"})]
})
