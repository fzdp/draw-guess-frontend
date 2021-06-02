<template>
    <div>
        <div class="form-primary">
            <h3 class="form-title">新用户注册</h3>

            <div class="form-input-field" :class="{'field-error': error.username}">
                <label for="">用户名</label>
                <input type="text" placeholder="2-15位的字母、数字和下划线组合" v-model="username" required>
                <p class="msg-error" v-for="(msg, i) in error.username" :key="i">{{msg}}</p>
            </div>

            <div class="form-input-field" :class="{'field-error': error.password}">
                <label for="">密码</label>
                <input type="password" placeholder="" v-model="password" required>
                <p class="msg-error" v-for="(msg, i) in error.password" :key="i + 'b'">{{msg}}</p>
            </div>

            <div class="form-input-field" :class="{'field-error': error.email}">
                <label for="">邮箱</label>
                <input type="email" placeholder="填写您的常用邮箱" v-model="email" required>
                <p class="msg-error" v-for="(msg, i) in error.email" :key="i + 'a'">{{msg}}</p>
            </div>

            <div class="form-input-field" :class="{'field-error': error.emailCode}">
                <label for="">邮箱验证码</label>
                <div class="form-inline-field">
                    <input type="text" placeholder="" v-model="emailCode" required>
                    <button @click="getEmailCode" :disabled="getCodeEnableAfter > 0">
                        {{btnGetCodeText}}
                    </button>
                </div>
                <p class="msg-error" v-for="(msg, i) in error.emailCode" :key="i + 'c'">{{msg}}</p>
            </div>

            <button class="button-form-submit" @click="onSubmit">注册</button>

        </div>
        <router-link :to="{name: 'sign_in', query: { redirect: $route.query.redirect }}" replace>
            已有账号？点击登录
        </router-link>
    </div>
</template>

<script>
  import {testEmail, testUsername} from "../lib/validation";

  export default {
    data() {
      return {
        username: "",
        email: "",
        emailCode: "",
        password: "",
        error: {},
        getCodeEnableAfter: 0
      }
    },

    computed: {
      btnGetCodeText() {
        if (this.getCodeEnableAfter > 0) {
          return `已发送（${this.getCodeEnableAfter}秒）`
        } else {
          return "获取验证码";
        }
      }
    },

    methods: {
      getEmailCode() {
        if (!this.email) {
          this.$set(this.error, "email", ["请填写完整"]);
          return;
        }
        if (!testEmail(this.email)) {
          this.$set(this.error, "email", ["无效的邮箱"]);
          return;
        }
        this.$api.post("/users/send_sign_up_email", {
          email: this.email,
        }).then((res) => {
          if (res.data.error) {
            this.error = res.data.error;
            return;
          }
          this.$toast("验证码已发送");
          this.$set(this.error, "email", null);
          this.getCodeEnableAfter = 60;
          let codeInterval = setInterval(() => {
            this.getCodeEnableAfter -= 1;
            if (this.getCodeEnableAfter <= 0) {
              clearInterval(codeInterval);
            }
          }, 1000);
        })
      },

      onSubmit() {
        const blankMessage = "请填写完整";
        if (!this.username) {
          this.error = {"username": [blankMessage]};
          return;
        }
        if (!testUsername(this.username)) {
          this.error = {"username": ["格式不正确"]};
          return;
        }
        if (!this.password) {
          this.error = {"password": [blankMessage]};
          return;
        }
        if (!this.email) {
          this.error = {"email": [blankMessage]};
          return;
        }
        if (!testEmail(this.email)) {
          this.error = {"email": ["格式不正确"]};
          return;
        }
        if (!this.emailCode) {
          this.error = {"emailCode": [blankMessage]};
          return;
        }

        const payload = {
          username: this.username,
          email: this.email,
          email_code: this.emailCode,
          password: this.password
        };
        this.$api.post("/users", payload)
            .then((res) => {
              if (res.data.error) {
                this.error = res.data.error;
                return;
              }
              this.error = {};
              const data = res.data.data;
              this.$store.commit("setUser", data.user);
              this.$store.commit("setToken", data.token);
              if (this.$route.query.redirect) {
                this.$router.replace({path: this.$route.query.redirect});
              } else {
                this.$router.replace({name: "index"});
              }
            })
      }
    }
  }
</script>
