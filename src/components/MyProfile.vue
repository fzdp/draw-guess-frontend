<template>
    <div>
        <Modal v-if="showDarkModeModal" @close="showDarkModeModal=false">
            <template v-slot:body>
                <div class="form-input-field">
                    <input type="checkbox" v-model="darkMode" id="darkMode">
                    <label for="darkMode">夜间模式</label>
                </div>
            </template>
        </Modal>

        <Modal v-if="showNameModal" @close="showNameModal=false">
            <template v-slot:header>修改昵称</template>
            <template v-slot:body>
                <div class="form-input-field form-inline-field">
                    <input type="text" :value="$store.state.user.name" ref="inputName">
                    <button @click="updateName">提交</button>
                </div>
            </template>
        </Modal>

        <div class="header-primary">
            <div class="header-left">
                <button @click="$router.back()" class="btn-back"></button>
            </div>
            <div class="header-center">
                <strong>个人中心</strong>
            </div>
        </div>

        <div class="container container-fixed profile-section">
            <div class="main-info">
                <div class="avatar-container">
                    <img :src="$store.state.user.avatar_url" alt="">
                </div>
                <div class="info-container">
                    <p><strong>@{{$store.state.user.username}}</strong></p>
                    <p>{{$store.state.user.name}}</p>
                </div>
            </div>

            <div class="settings-container">
                <div class="setting-item" @click="showNameModal=true">
                    <div>昵称：{{$store.state.user.name}}</div>
                    <div class="btn-next"></div>
                </div>

                <router-link :to="{name: 'score_records'}" class="setting-item">
                    <div>积分：{{$store.state.user.score}}</div>
                    <div class="btn-next"></div>
                </router-link>

                <div class="setting-item" @click="showDarkModeModal=true">
                    <div>
                        夜间模式：<strong>{{textDarkMode}}</strong>
                    </div>
                    <div class="btn-next"></div>
                </div>

                <router-link :to="{name: 'new_room'}" class="setting-item">
                    <div>创建房间</div>
                    <div class="btn-next"></div>
                </router-link>

                <div class="setting-item sign_out-item" @click="logout">
                    <p class="msg-error">退出登录</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import Modal from "./Modal";
  import {testName} from "../lib/validation";

  export default {
    components: {Modal},
    data() {
      return {
        showDarkModeModal: false,
        showNameModal: false
      }
    },

    methods: {
      logout() {
        this.$store.commit("logout");
        this.$router.replace({name: "index"});
      },
      updateName() {
        const name = this.$refs.inputName.value.trim();
        if (name === this.$store.state.user.name) {
          this.$toast.error("昵称没有变化");
          return;
        }
        if (!name) {
          this.$toast.error("请填写完整");
        } else if (name.length > 15 || name.length < 2) {
          this.$toast.error("只能包含2～15个字符")
        } else if (!testName(name)) {
          this.$toast.error("只能包含中英文、字母、数字和下划线");
        } else {
          this.$api.post("users/update_name", {name: name}).then((res) => {
            if (res.data.error) {
              this.$toast.error(res.data.error);
              return;
            }
            const resData = res.data.data;
            this.$store.commit("setNickName", {
              name: resData.name,
              avatarUrl: resData.avatar_url,
              thumbAvatarUrl: resData.thumb_avatar_url
            });
            this.showNameModal = false;
          });
        }
      }
    },

    computed: {
      textDarkMode() {
        return this.$store.state.darkMode ? "已开启" : "已关闭"
      },
      darkMode: {
        get() {
          return this.$store.state.darkMode;
        },
        set(value) {
          this.$store.commit("setDarkMode", value);
          this.toggleDarkMode(value);
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
    .profile-section {
        padding: 0 10px 10px;
    }

    .avatar-container {
        width: 120px;
    }

    .info-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 10px;
        text-align: left;
    }

    .settings-container {
        text-align: left;
        font-weight: bold;
    }

    .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 15px;
        margin-bottom: 10px;
        border: 1px solid #81b214;
        border-radius: 8px;
        cursor: pointer;
    }

    .sign_out-item {
        margin-top: 20px;
        justify-content: center;
    }

    .main-info {
        display: flex;
        margin-bottom: 10px;

        img {
            width: 80px;
            height: 80px;
            border-radius: 40px;
        }
    }

</style>
