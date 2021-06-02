<template>
    <div>

        <div class="form-primary">
            <h3 class="form-title">用户登录</h3>
            <div class="form-input-field">
                <label for="">登录名</label>
                <input type="text" v-model="login" placeholder="用户名或邮箱" required>
            </div>

            <div class="form-input-field">
                <label for="">密码</label>
                <input type="password" v-model="password" required>
                <router-link :to="{name: 'reset_password'}">忘记密码？</router-link>
            </div>

            <button class="button-form-submit" @click="onSubmit">登录</button>
        </div>

        <router-link :to="{name: 'sign_up', query: { redirect: $route.query.redirect }}" replace>
            还没有账号？点击注册
        </router-link>
    </div>
</template>

<script>
  export default {
    data() {
      return {
        password: "",
        login: "",
      }
    },
    methods: {
      onSubmit() {
        if (!this.login || !this.password) {
          this.$toast.error("登录名和密码请填写完整");
          return;
        }
        const payload = {
          login: this.login,
          password: this.password,
        };
        this.$api.post("/users/login", payload)
            .then((res) => {
              if (res.data.error) {
                this.$toast.error(res.data.error);
                return;
              }
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
