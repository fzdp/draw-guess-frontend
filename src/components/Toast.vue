<template>
    <div class="toast" :class="`toast-${level}`">
        <strong>{{text}}</strong>
    </div>
</template>

<script>
  export default {
    data() {
      return {
        text: "",
        level: "info",
        duration: 1500
      }
    },
    mounted() {
      setTimeout(() => {
        this.$destroy();
        this.$el.parentNode.removeChild(this.$el);
      }, this.duration);
    }
  }
</script>

<style scoped>
    .toast {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        left: 0;
        right: 0;
        top: 20px;
        z-index: 2000;
    }

    .toast > strong {
        min-width: 120px;
        padding: 5px;
        color: #ffffff;
        background: #929aab;
        border-radius: 6px;
    }

    .toast-error > strong {
        background: #e1e5ea;
        color: #e84545;
    }
</style>
