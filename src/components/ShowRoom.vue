<template>
    <div>
        <Modal v-if="selectedUser" @close="selectedUser=null">
            <template v-slot:body>
                <div class="main-container">
                    <div class="avatar-container">
                        <img :src="selectedUser.thumb_avatar_url" alt="">
                    </div>
                    <div class="info-container">
                        <p><strong>@{{selectedUser.username}}</strong></p>
                        <p>{{selectedUser.name}}</p>
                    </div>
                </div>
            </template>
        </Modal>

        <Modal v-if="showInviteModal" @close="showInviteModal=false">
            <template v-slot:header>邀请好友</template>
            <template v-slot:body>
                <div class="form-input-field form-inline-field">
                    <input type="text" :value="roomLink" readonly ref="roomLinkInput">
                    <button @click="copyRoomLink">复制链接</button>
                </div>
                <p class="msg-info">复制上面的链接，分享给您的好友</p>
            </template>
        </Modal>

        <Modal v-if="gameState === 'wait_for_ready'" :can-close="false">
            <template v-slot:header>
                游戏即将开始
            </template>

            <template v-slot:body>
                <div class="user-display-container" v-for="(player,i) in joinedUsers" :key="i">
                    <div class="user-avatar-container">
                        <img :src="player.thumb_avatar_url" alt="" class="img-avatar">
                        <strong>{{player.name}}</strong>
                    </div>
                    <button class="button-primary" v-if="currentUserNotReady(player)" @click="onReadyButtonClicked">
                        准备好了
                    </button>
                    <span v-else>{{showReadyText(player)}}</span>
                </div>
            </template>
        </Modal>

        <Modal v-if="showLeaveRoomModal" @close="closeLeaveRoomModal">
            <template v-slot:header>您已退出房间</template>
            <template v-slot:body>
                <button class="button-primary" @click="confirmLeaveRoom">确定</button>
                <button class="button-primary" @click="reloadRoom" id="btnReloadRoom">刷新</button>
            </template>
        </Modal>

        <Modal v-if="showSaveImageModal" @close="showSaveImageModal = false">
            <template v-slot:header>长按保存图片</template>
            <template v-slot:body>
                <img src="" alt="" class="img-preview">
            </template>
        </Modal>

        <Modal v-if="showAuthModal" :can-close="false">
            <template v-slot:header>请输入房间密码</template>
            <template v-slot:body>
                <div class="form-input-field form-inline-field">
                    <input type="text" id="password" v-model="roomPassword">
                    <button @click="authRoom(roomPassword)">提交</button>
                </div>
            </template>
        </Modal>

        <Modal v-if="(gameState === 'choosing_word') && isPainter" :can-close="false">
            <template v-slot:header>
                选择一个词语
            </template>

            <template v-slot:body>
                <div class="container">
                    <div class="row">
                        <div class="col-4 col-12-small" v-for="(word, i) in words" :key="i">
                            <div>
                                <button class="button-primary" @click="onWordChosen(word)">
                                    <strong>{{word}}</strong>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template v-slot:footer>
                <div class="choosing-word-footer" v-if="countdown">
                    <div>
                        <strong @click="skipWords">跳过</strong>
                    </div>
                    <div>
                        <span class="countdown-timer">{{countdown}}</span>
                    </div>
                    <div>
                        <strong @click="refreshWords" v-if="refreshWordsCount > 0">换一组 ({{refreshWordsCount}})</strong>
                    </div>
                </div>
            </template>
        </Modal>

        <Modal v-if="gameState === 'round_over'" :can-close="false">
            <template v-slot:header>
                本轮游戏结束
            </template>

            <template v-slot:body>
                <strong>答案是: {{answer}}</strong>
                <div class="guess-result-container">
                    <div class="user-display-container" v-for="(user, i) in winners" :key="i">
                        <div class="user-avatar-container">
                            <img :src="user.thumb_avatar_url" alt="" class="img-avatar">
                            <strong>{{user.name}}</strong>
                        </div>
                        <p>猜对了！</p>
                    </div>
                </div>
            </template>

            <template v-slot:footer>
                <span class="countdown-timer" v-if="countdown">{{countdown}}</span>
            </template>
        </Modal>

        <Modal v-if="showSettingsModal" @close="showSettingsModal = false">
            <template v-slot:header>设置</template>
            <template v-slot:body>
                <div>
                    <div class="form-input-field">
                        <input type="checkbox" v-model="darkMode" id="darkMode">
                        <label for="darkMode">夜间模式</label>
                    </div>

                    <div class="form-input-field form-inline-field" v-if="canShowRoomPassword">
                        <input type="text" ref="roomPasswordInput" :value="room.password" pattern="[A-Za-z0-9]+">
                        <button @click="updateRoom">修改密码</button>
                    </div>

                    <div class="form-input-field form-inline-field">
                        <input type="text" :value="roomLink" readonly ref="roomLinkInput">
                        <button @click="copyRoomLink">复制链接</button>
                    </div>
                </div>
            </template>
        </Modal>

        <div class="header-primary">
            <div class="header-left">
                <div v-if="gameState === 'wait_for_joining'">
                    <strong>等待其他玩家加入</strong>
                </div>
                <div v-if="isGuessing">
                    <span class="countdown-timer" v-if="countdown">{{countdown}}</span>
                    <strong>{{answerHint}}</strong>
                </div>

                <div v-if="isDrawing">
                    <span class="countdown-timer" v-if="countdown">{{countdown}}</span>
                    <strong @click="showAnswer = !showAnswer">
                        {{showAnswer ? answer : " * ".repeat(answer.length) }}
                    </strong>
                </div>

                <div v-if="isGuesser && gameState === 'choosing_word'">
                    <span class="countdown-timer" v-if="countdown">{{countdown}}</span>
                    <strong>{{painter.name}}</strong>正在选词...
                </div>
            </div>

            <div class="header-right">
                <button class="no-padding" @click="downloadImage">
                    <img src="../assets/download.png" alt="">
                </button>
                <button class="no-padding" @click="showSettingsModal = true">
                    <img src="../assets/settings.png" alt="">
                </button>
            </div>
        </div>

        <div class="container">
            <div class="row">
                <div class="col-7 col-12-medium">
                    <DrawingBoard :key="drawingBoardKey" :can-draw="canDraw" :can-emit="isDrawing" @draw="onUserDrawing"
                                  ref="drawingBoard"/>
                </div>
                <div class="col-5 col-12-medium">
                    <div class="row chat-container border-primary">
                        <div class="users-container y-scroll">
                            <div class="user-item text-ellipsis" v-for="user in joinedUsers" :key="user.id"
                                 @click="selectedUser=user">
                                <img :src="usersDict[user.id].thumb_avatar_url" class="img-avatar lg" alt="">
                                <img class="status-indicator" src="../assets/painter.png" alt=""
                                     v-if="user.id === painterId">
                                <img class="status-indicator" src="../assets/winner.png" alt=""
                                     v-else-if="winnerIds.includes(user.id)">
                            </div>

                            <div class="user-item" @click="showInviteModal=true">
                                <img src="../assets/invite.png" alt="" class="img-avatar lg">
                            </div>
                        </div>
                        <div class="col messages-container y-scroll" id="messagesContainer">
                        </div>
                    </div>
                    <div class="form-input-field form-inline-field message-input-container">
                        <input @keyup.enter="onSendMessageButtonClicked" type="text" placeholder="按下回车键即可发送文字"
                               v-model="messageContent"/>
                        <button @click="onSendMessageButtonClicked">发送</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import Vue from "vue";
  import DrawingBoard from "./DrawingBoard";
  import Modal from "./Modal";
  import RoomMessage from "./RoomMessage";
  import ActionCable from "actioncable";
  import {generateRandomId} from "../lib/util";
  import IdleMonitor from "../lib/idle_monitor";

  const CABLE_URL = process.env.VUE_APP_CABLE_URL;

  export default {
    props: {
      id: [String, Number]
    },
    components: {DrawingBoard, Modal},

    data() {
      return {
        drawingBoardKey: 0,
        gameState: "no_body",
        room: null,
        joinedUsers: [],
        readyUserIds: [],
        winnerIds: [],
        messages: [],
        messageContent: "",
        words: [],
        painterId: null,
        answerHint: "",
        answer: "",
        drawingData: {},
        countdown: 0,
        roomPassword: "",
        refreshWordsCount: 1,
        offline: false,
        leaveReason: "",
        showSettingsModal: false,
        showAuthModal: false,
        showSaveImageModal: false,
        showLeaveRoomModal: false,
        showInviteModal: false,
        canvasOperations: [],
        showAnswer: true,
        roomLink: window.location.href,
        selectedUser: null
      }
    },

    watch: {
      drawingData: {
        immediate: true,
        deep: true,
        handler: 'handleDrawSync'
      },

      gameState: {
        immediate: true,
        deep: true,
        handler: 'handleGameStateChange'
      },

      painterId: {
        immediate: true,
        deep: true,
        handler: "handlePainterIdChange"
      },

      joinedUsers: {
        immediate: true,
        deep: true,
        handler: "handleJoinedUsersChange"
      }
    },

    beforeRouteLeave(to, from, next) {
      if (this.gameState === "wait_for_joining") {
        this.leaveReason = "user";
        next();
      } else {
        const answer = window.confirm('确定退出房间吗？');
        if (answer) {
          this.leaveReason = "user";
          next();
        } else {
          next(false);
        }
      }
    },

    computed: {
      canShowRoomPassword() {
        return !this.room.is_public && this.room.creator.id === this.$store.state.user.id;
      },

      painter() {
        return this.joinedUsers.find((u) => u.id === this.painterId);
      },

      darkMode: {
        get() {
          return this.$store.state.darkMode;
        },
        set(value) {
          this.$store.commit("setDarkMode", value);
          this.toggleDarkMode(value);
          this.$refs.drawingBoard.setStageBackground();
        }
      },

      canDraw() {
        if (this.gameState === "wait_for_joining") {
          return true;
        } else {
          if (this.painterId) {
            return this.painterId === this.$store.state.user.id;
          }
          return true;
        }
      },

      isDrawing() {
        return (this.gameState === "drawing") && this.isPainter;
      },

      isGuessing() {
        return (this.gameState === "drawing") && this.isGuesser;
      },

      isPainter() {
        return this.painterId === this.$store.state.user.id;
      },

      isGuesser() {
        if (this.painterId) {
          return this.painterId !== this.$store.state.user.id;
        }
        return false;
      },

      winners() {
        return this.joinedUsers.filter(user => this.winnerIds.includes(user.id));
      }
    },

    methods: {
      confirmLeaveRoom() {
        window.location.href = "/";
      },

      reloadRoom() {
        window.location.reload();
      },

      downloadImage() {
        const imgUrl = this.$refs.drawingBoard.exportImage();
        if (this.isTouchDevice()) {
          this.showSaveImageModal = true;
          setTimeout(() => {
            document.getElementsByClassName("img-preview")[0].src = imgUrl;
          }, 0);
        } else {
          let link = document.createElement('a');
          link.download = "artwork_" + generateRandomId() + ".png";
          link.href = imgUrl;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            link = null;
          }, 0);
        }
      },

      updateRoom() {
        const passwordInput = this.$refs.roomPasswordInput.value.trim();
        if (!passwordInput) {
          this.$toast.error("请输入新密码");
          return;
        }
        if (passwordInput === this.room.password) {
          this.$toast("密码已更新");
          return;
        }
        this.$api.patch(`/rooms/${this.id}`, {
          password: passwordInput
        }).then((res) => {
          if (res.data.error) {
            this.$toast.error("密码更新失败");
            return;
          }
          this.$set(this.room, 'password', passwordInput);
          this.$toast("密码已更新");
        })
      },

      copyRoomLink() {
        this.$refs.roomLinkInput.focus();
        this.$refs.roomLinkInput.select();
        document.execCommand("copy");
        this.$toast("链接已复制");
      },

      onReadyButtonClicked() {
        this.roomChannel.perform("event_user_is_ready");
      },

      onSendMessageButtonClicked() {
        if (this.messageContent.trim()) {
          if (this.joinedUsers.length > 1) {
            this.roomChannel.send({content: this.messageContent});
          } else {
            this.appendMessage({
              sender: this.$store.state.user.id,
              content: this.messageContent
            })
          }
        }
        this.messageContent = "";
      },

      refreshWords() {
        if (this.isPainter && this.refreshWordsCount > 0) {
          this.roomChannel.perform("event_user_refresh_words");
          this.refreshWordsCount -= 1;
        }
      },

      skipWords() {
        if (this.isPainter) {
          this.roomChannel.perform("event_user_skip_choosing_word");
        }
      },

      onWordChosen(word) {
        this.answer = word;
        this.roomChannel.perform("event_user_choose_word", {word: word});
      },

      currentUserNotReady(user) {
        return user.id === this.$store.state.user.id && !this.isReady(this.$store.state.user);
      },

      isReady(user) {
        return this.readyUserIds.includes(user.id);
      },

      showReadyText(user) {
        return this.isReady(user) ? "已准备" : "准备中";
      },

      onUserDrawing(data) {
        this.roomChannel.perform("event_user_draw", {"operation": data});
      },

      handleDrawSync(data) {
        if (data.tool) {
          this.$refs.drawingBoard.handleDrawingOperation(data);
        }
      },

      buildCanvas() {
        if (this.canvasOperations.length) {
          this.$refs.drawingBoard.applyFullOperations(this.canvasOperations);
        }
      },

      startCountdownTimer() {
        this.clearCountDownTimer();
        this.intervalId = window.setInterval(() => {
          if (this.countdown <= 0) {
            this.clearCountDownTimer();
          } else {
            this.countdown -= 1;
          }
        }, 1000)
      },

      clearCountDownTimer() {
        if (this.intervalId) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }
      },

      handleGameStateChange(newState) {
        this.clearCountDownTimer();
        if (['drawing', 'wait_for_joining', 'wait_for_ready'].includes(newState)) {
          this.drawingBoardKey += 1;
        } else if (newState === "choosing_word") {
          this.refreshWordsCount = 1;
        } else if (newState === "round_over" && this.isPainter) {
          const canvasSize = this.$refs.drawingBoard.getStageContainerSize();
          this.roomChannel.perform("save_canvas_data", {
            width: canvasSize.width, height: canvasSize.height, image: this.$refs.drawingBoard.exportImage()
          })
        }
      },

      handlePainterIdChange() {
        if (this.isPainter) {
          this.roomChannel.perform("event_get_words");
        }
      },

      handleJoinedUsersChange() {
        this.usersDict = {};
        this.joinedUsers.forEach((u) => {
          this.usersDict[u.id] = u;
        });
      },

      handleBeforeUnload(e) {
        if (this.gameState !== "wait_for_joining") {
          e.preventDefault();
          e.returnValue = "";
        }
      },

      closeLeaveRoomModal() {
        this.showLeaveRoomModal = false;
        this.idleMonitor.start();
      },

      forceLeaveRoom() {
        this.showLeaveRoomModal = true;
        this.leaveReason = "idle";
        if (this.cable) {
          this.cable.disconnect();
        }
        window.removeEventListener("beforeunload", this.handleBeforeUnload);
      },

      authRoom(password, saveToStore = true) {
        this.$api.post(`rooms/${this.id}/auth`, {
          password: password
        }).then((res) => {
          if (res.data.error) {
            if (password) {
              this.$toast.error("密码错误");
            }
            this.showAuthModal = true;
            return;
          }
          this.showAuthModal = false;
          if (saveToStore) {
            this.$store.commit("setRoomPassword", {roomId: this.id, password: password});
          }
          this.idleMonitor = new IdleMonitor({
            timeout: 120,
            onIdle: this.forceLeaveRoom
          }).start();
          this.connectRoom();
        })
      },

      appendMessage(data) {
        if (data.sender && !this.usersDict[data.sender]) {
          return;
        }
        let self = this;
        const messageComponent = new Vue({
          ...RoomMessage,
          propsData: {
            user: data.sender ? self.usersDict[data.sender] : null,
            message: data.content
          }
        });
        messageComponent.$on("userclick", (user) => {
          this.selectedUser = user;
        });
        const messageContainerNode = document.getElementById("messagesContainer");
        messageContainerNode.appendChild(messageComponent.$mount().$el);

        this.$nextTick(() => {
          messageContainerNode.scrollTop = messageContainerNode.scrollHeight - messageContainerNode.clientHeight;
        });
      },

      connectRoom() {
        let token = this.$store.state.token;

        this.cable = ActionCable.createConsumer(`${CABLE_URL}?token=${token}`);
        this.roomChannel = this.cable.subscriptions.create({channel: "RoomChannel", room_id: this.id}, {
          connected: () => {
            this.roomChannel.perform("get_room_data");
            if (this.offline) {
              this.$toast("已重新连接");
              this.offline = false;
            }
          },
          disconnected: () => {
            this.clearCountDownTimer();
            if (!this.leaveReason) {
              this.offline = true;
              this.$toast.error("您已掉线，请检查网络连接");
            }
          },
          received: (data) => {
            if (data.excluded === this.$store.state.user.id) {
              return;
            }
            if (data.added) {
              this.joinedUsers.push(data.added);
            }
            if (data.removed) {
              this.joinedUsers.splice(this.joinedUsers.indexOf(data.removed), 1);
            }
            if (data.message) {
              this.appendMessage(data.message);
            }
            if (data.data) {
              const affectedData = data.data;
              Object.keys(affectedData).forEach(key => {
                this.$set(this, key, affectedData[key]);
              });
              if (affectedData.countdown) {
                setTimeout(() => {
                  this.startCountdownTimer();
                }, 0);
              }
              if (affectedData.canvasOperations) {
                setTimeout(() => {
                  this.buildCanvas();
                }, 0);
              }
            }
          }
        });
      }
    },

    created() {
      window.addEventListener("beforeunload", this.handleBeforeUnload);
    },

    mounted() {
      this.authRoom(this.$store.state.roomPasswords[this.id], false);
    },

    beforeDestroy() {
      this.clearCountDownTimer();
      if (this.cable) {
        this.cable.disconnect();
      }
      if (this.idleMonitor) {
        this.idleMonitor.stop();
      }
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
    },
  }
</script>

<style lang="scss" scoped>
    .chat-container {
        height: 520px;
    }

    .users-container {
        display: flex;
        flex-direction: column;
        width: 70px;
        height: 100%;
        border-right: 3px solid #81b214;
    }

    .user-item {
        position: relative;
        margin-top: 10px;
        cursor: pointer;
    }

    .user-item .status-indicator {
        position: absolute;
        right: 1px;
        bottom: 1px;
        width: 16px;
        height: 16px;
    }

    .messages-container {
        padding: 10px 8px;
        text-align: left;
        height: 100%;
    }

    .messages-container > div {
        margin-top: 10px;
    }

    .message-input-container {
        margin-top: 15px;
        margin-bottom: 0;
    }

    .user-display-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 260px;
        margin: 10px auto;
    }

    .choosing-word-footer {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .choosing-word-footer > div {
        width: 33.33%;
    }

    .countdown-timer {
        font-size: 28px;
        font-weight: bold;
        color: #fdb827;
        display: inline-block;
    }

    .header-primary .countdown-timer {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .img-preview {
        height: 25vh;
        width: auto;
        display: inline-block;
        -webkit-touch-callout: default;
    }

    #btnReloadRoom {
        margin-left: 15px;
    }

    .main-container {
        display: flex;

        .avatar-container {
            img {
                width: 50px;
                height: 50px;
            }
        }

        .info-container {
            margin-left: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: left;
        }
    }

    .user-avatar-container {
        img + * {
            vertical-align: middle;
            margin-left: 8px;
        }
    }

    @media screen and (max-width: 600px) {
        .chat-container {
            height: 250px;
        }
        .message-input-container {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 0 10px;
            background: #ffffff;
            z-index: 1000;
        }
        .chat-container {
            margin-bottom: 40px;
        }
    }
</style>
