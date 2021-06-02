<template>
    <div>
        <div class="header-primary">
            <div class="header-left">
                <button class="btn-back" @click="$router.back()"></button>
            </div>
            <div class="header-center">
                创建房间
            </div>
        </div>

        <div class="form-primary">
            <div class="form-input-field" :class="{'field-error': errors.name}">
                <label for="">房间名字</label>
                <input type="text" placeholder="" v-model="roomName" required>
                <p class="msg-error" v-for="(msg,i) in errors.name" :key="'a' + i">
                    {{msg}}
                </p>
            </div>

            <div class="form-input-field">
                <input type="checkbox" v-model="roomIsPublic" id="isPublic">
                <label for="isPublic">对所有人开放</label>
            </div>

            <div class="form-input-field" :class="{'field-error': errors.password}" v-if="!roomIsPublic">
                <label for="password">设置密码</label>
                <input type="text" id="password" v-model="password" placeholder="4到12位的字母或数字组合">
                <p class="msg-error" v-for="(msg,i) in errors.password" :key="'b' + i">
                    {{msg}}
                </p>
                <p class="msg-info">其他玩家访问你的私人房间时需要密码验证</p>
            </div>

            <button class="button-form-submit" @click="submit">提交</button>
        </div>
    </div>
</template>

<script>
  import {testRoomPassword} from "../lib/validation";

  export default {
    data() {
      return {
        roomName: "",
        roomIsPublic: false,
        password: "",
        errors: {}
      }
    },
    methods: {
      submit() {
        this.errors = {};
        if (!this.roomName) {
          this.errors = {name: ["请填写完整"]};
          return;
        }
        if (!this.roomIsPublic && !this.password) {
          this.errors = {password: ["请填写完整"]};
          return;
        }
        if (!this.roomIsPublic && !testRoomPassword(this.password)) {
          this.errors = {password: ["格式不正确"]};
          return;
        }
        this.$api.post("/rooms", {
          name: this.roomName,
          is_public: this.roomIsPublic,
          password: this.password
        }).then((res) => {
          if (res.data.error) {
            this.errors = res.data.error;
          } else {
            this.$router.back();
          }
        })
      }
    }
  }
</script>

<style scoped>
</style>
