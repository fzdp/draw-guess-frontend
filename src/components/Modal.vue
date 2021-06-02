<template>
    <transition name="modal">
        <div class="modal-mask" @touchmove.prevent>
            <div class="modal-wrapper">
                <div class="modal-container">
                    <button v-if="canClose" class="btn-modal-close" @click="$emit('close')">
                        <img src="../assets/close.png" alt="">
                    </button>

                    <div class="modal-header">
                        <slot name="header">
                        </slot>
                    </div>

                    <div class="modal-body">
                        <slot name="body">
                            default body
                        </slot>
                    </div>

                    <div class="modal-footer">
                        <slot name="footer">
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
  export default {
    props: {
      canClose: {
        type: Boolean,
        default: true
      }
    },

    created() {
      document.body.style.overflowY = "hidden";
    },

    beforeDestroy() {
      document.body.style.overflowY = "auto";
    }
  }
</script>

<style scoped>
    .modal-mask {
        position: fixed;
        z-index: 1001;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: table;
        transition: opacity 0.3s ease;
    }

    .modal-wrapper {
        display: table-cell;
        vertical-align: middle;
    }

    .modal-container {
        position: relative;
        width: 86%;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px 30px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
        font-family: Helvetica, Arial, sans-serif;
    }

    .btn-modal-close {
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
    }

    .btn-modal-close img {
        width: 20px;
        height: 20px;
    }

    body.bg-transition .modal-container {
        transition: all 0.3s ease, background-color 800ms linear;
    }

    .modal-header {
        font-size: 26px;
        font-weight: bold;
        color: #42b983;
    }

    .modal-default-button {
        float: right;
    }

    .modal-enter {
        opacity: 0;
    }

    .modal-leave-active {
        opacity: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    }

    .modal-body {
        margin: 30px 0 0;
    }

    .modal-header:empty + .modal-body {
        margin-top: 0;
    }

    .modal-footer {
        margin-top: 30px;
    }

    .modal-footer:empty {
        margin-top: 0;
    }

    @media screen and (max-width: 600px) {
        .modal-header {
            font-size: 20px;
        }

        .btn-modal-close img {
            width: 15px;
            height: 15px;
        }

        .modal-body {
            margin: 20px 0 0;
        }

        .modal-footer {
            margin-top: 20px;
        }
    }
</style>
