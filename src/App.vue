<template>
  <div id="app">
      <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.toggleDarkMode(this.$store.state.darkMode);
    setTimeout(() => {
      document.body.classList.add("bg-transition");
    }, 1000);
    if (this.isTouchDevice()) {
      window.stageHeight = window.innerHeight * 0.6;
    }
  }
}
</script>
