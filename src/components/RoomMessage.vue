<template>
    <div>
        <div class="message-item">
            <template v-if="user">
                <button @click="onClicked">
                    <img :src="user.thumb_avatar_url" alt="" class="img-avatar sm">
                </button>
            </template>

            <template v-else>
                <button>
                    <img src="../assets/notification.png" alt="" class="img-avatar sm">
                </button>
            </template>

            <p>{{message}}</p>
        </div>
    </div>
</template>

<script>
  export default {
    props: {user: Object, message: String},
    data() {
      return {
        showModal: false
      }
    },
    methods: {
      onClicked() {
        this.$emit('userclick', this.user)
      }
    }
  }
</script>

<style lang="scss" scoped>
    .message-item {
        display: flex;
        align-items: flex-start;
        padding: 5px 0;

        p {
            margin-left: 5px;
            flex: 1;
            word-break: break-word;
        }
    }

</style>
