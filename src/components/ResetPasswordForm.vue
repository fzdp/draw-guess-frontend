<template>
    <div>
        <div class="form-primary">
            <h3 class="form-title">重置密码</h3>

            <p class="msg-info">
                验证码已经发送到您的登录邮箱了：<strong>{{email}}</strong>，有效期为10分钟。
            </p>

            <div class="form-input-field">
                <label for="">验证码</label>
                <input type="text" placeholder="" v-model="emailToken" required>
            </div>

            <div class="form-input-field">
                <label for="">新密码</label>
                <input type="password" placeholder="" v-model="password" required>
            </div>

            <div class="form-input-field">
                <label for="">确认新密码</label>
                <input type="password" placeholder="" v-model="password_confirmation" required>
            </div>

            <button class="button-form-submit" @click="resetPassword" :disabled="!email">提交</button>
        </div>
    </div>
</template>

<script>
  export default {
    props: {
      email: String
    },

    data() {
      return {
        password: "",
        password_confirmation: "",
        emailToken: "",
      }
    },

    methods: {
      resetPassword() {
        if (!this.email) {
          return;
        }
        if (!this.emailToken || !this.password || !this.password_confirmation) {
          this.$toast.error("请将表单填写完整");
          return;
        }
        if (this.password !== this.password_confirmation) {
          this.$toast.error("密码不一致");
          return;
        }
        this.$api.post("/users/reset_password", {
          email: this.email,
          token: this.emailToken,
          password: this.password,
          password_confirmation: this.password_confirmation
        }).then((res) => {
          if (res.data.error) {
            this.$toast.error(res.data.error);
            return;
          }
          this.$router.replace({name: "sign_in"})
        })
      }
    }
  }
</script>
