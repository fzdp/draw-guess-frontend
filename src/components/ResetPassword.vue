<template>
    <div>
        <div class="form-primary">
            <h3 class="form-title">重置密码</h3>

            <div class="form-input-field form-inline-field">
                <input type="text" v-model="email" placeholder="请填写您的登录邮箱">
                <button @click="sendEmail" :disabled="!email.length">提交</button>
            </div>
        </div>
    </div>
</template>

<script>
  import {testEmail} from "../lib/validation";

  export default {
    data() {
      return {
        email: "",
      }
    },

    methods: {
      sendEmail() {
        if (!testEmail(this.email)) {
          this.$toast.error("邮箱格式不正确");
          return;
        }
        this.$api.post("/users/send_reset_password_email", {email: this.email})
            .then((res) => {
              if (res.data.error) {
                this.$toast.error(res.data.error);
                return;
              }
              this.$router.push({name: "reset_password_form", params: {email: this.email}});
            })
      },
    }
  }
</script>
