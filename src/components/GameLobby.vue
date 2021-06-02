<template>
    <div>
        <div class="header-primary">
            <div class="header-left">
                <a href="/">
                    <img src="../assets/logo.png" alt="" class="img-logo">
                    <strong class="text-logo">udig.online</strong>
                </a>
            </div>
            <div class="header-right">
                <template v-if="$store.state.user">
                    <router-link :to="{name: 'profile'}" class="profile-info">
                        <strong>{{$store.state.user.name}}</strong>
                        <img :src="$store.state.user.thumb_avatar_url" alt="" class="img-avatar">
                    </router-link>
                </template>

                <template v-else>
                    <router-link :to="{name: 'sign_up'}"><strong>注册</strong></router-link>
                    <router-link :to="{name: 'sign_in'}"><strong>登录</strong></router-link>
                </template>
            </div>
        </div>

        <div class="container container-fixed">
            <template v-if="$store.state.user">
                <template v-if="privateRoomList.length">
                    <div class="section-title">
                        <strong>我的私人房间</strong>
                        <strong>在线玩家：{{privateRoomUsersCount}}</strong>
                    </div>
                    <div class="row">
                        <div class="col-6 col-12-small" v-for="(room, i) in privateRoomList" :key="'a' + i">
                            <router-link class="room-item border-primary" :class="{'active': room.joined_count}"
                                         :to="{name:'show_room',params:{id:room.id}}">
                                <h3 class="text-ellipsis">{{room.name}}</h3>
                                <div class="">
                                    <p>玩家数量：<span class="">{{room.joined_count}}</span></p>
                                </div>
                            </router-link>
                        </div>
                    </div>
                </template>

                <div class="section-title">
                    <strong>公开的房间</strong>
                    <strong>在线玩家：{{publicRoomUsersCount}}</strong>
                </div>
                <div class="row">
                    <div class="col-6 col-12-small" v-for="(room, i) in roomList" :key="i">
                        <router-link class="room-item border-primary" :class="{'active': room.joined_count}"
                                     :to="{name:'show_room',params: {id:room.id}}">
                            <h3>{{room.name}}</h3>
                            <div class="">
                                <p>玩家数量：<span class="">{{room.joined_count}}</span></p>
                            </div>
                        </router-link>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="section-title">
                    <strong>公开的房间</strong>
                    <strong>在线玩家：{{publicRoomUsersCount}}</strong>
                </div>
                <div class="row">
                    <div class="col-6 col-12-small" v-for="(room, i) in roomList" :key="i">
                        <a class="room-item border-primary" href="javascript:" :class="{'active': room.joined_count}"
                           @click="onRoomClicked(room.id)">
                            <h3>{{room.name}}</h3>
                            <div class="">
                                <p>玩家数量：<span class="">{{room.joined_count}}</span></p>
                            </div>
                        </a>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
  import {generateRandomId} from "../lib/util";
  import ActionCable from "actioncable";

  const CABLE_URL = process.env.VUE_APP_CABLE_URL;

  export default {
    data() {
      return {
        roomList: [],
        privateRoomList: [],
        showModal: false
      }
    },
    computed: {
      publicRoomUsersCount() {
        return this.roomList.reduce((a, r) => a + r.joined_count, 0);
      },
      privateRoomUsersCount() {
        return this.privateRoomList.reduce((a, r) => a + r.joined_count, 0);
      }
    },
    methods: {
      onRoomClicked(roomId) {
        this.$toast("您需要登录");
        const roomUrl = this.$router.resolve({
          name: 'show_room',
          params: {id: roomId},
        }).route.fullPath;
        this.$router.push({name: "sign_in", query: {redirect: roomUrl}});
      },

      getGuestId() {
        let guestId = localStorage.getItem("guestId");
        if (!guestId) {
          guestId = generateRandomId();
          localStorage.setItem("guestId", guestId);
        }
        return guestId;
      },

      getRoomList() {
        this.$api.get("/rooms").then(res => {
          this.roomList = res.data.data.public;
          this.privateRoomList = res.data.data.private;

          this.cable = ActionCable.createConsumer(`${CABLE_URL}?guest_id=${this.getGuestId()}`);
          this.cable.subscriptions.create("RoomListChannel", {
            received: (data) => {
              const event = data.event;
              if (event === "created") {
                if (data.data.is_public) {
                  this.roomList.unshift(data.data);
                } else {
                  this.privateRoomList.unshift(data.data);
                }
              } else if (event === "joined" || event === "leaved") {
                let room = data.data;
                if (room.is_public) {
                  let index = this.roomList.findIndex(item => item.id === room.id);
                  if (index !== -1) {
                    this.roomList.splice(index, 1, room);
                  }
                } else {
                  let index = this.privateRoomList.findIndex(item => item.id === room.id);
                  if (index !== -1) {
                    this.privateRoomList.splice(index, 1, room);
                  }
                }
              }
            }
          });
        })
      }
    },

    created() {
      if (this.$store.state.token) {
        this.$api.get("/users/get_profile").then(res => {
          const user = res.data.data;
          this.$store.commit("setUser", user);
          this.getRoomList();
        })
      } else {
        this.getRoomList();
      }
    },

    beforeDestroy() {
      if (this.cable) {
        this.cable.disconnect();
      }
    }
  }
</script>

<style scoped>
    .img-logo {
        width: 28px;
        height: 28px;
        vertical-align: middle;
    }

    .text-logo {
        margin-left: 5px;
        font-size: 20px;
        color: #ffb26b;
        user-select: none;
    }

    .profile-info {
        display: flex;
        align-items: center;
        height: 100%;
    }

    .profile-info img {
        margin-left: 6px;
    }

    .section-title {
        display: flex;
        justify-content: space-between;
        margin: 0 10px 10px;
        padding: 8px 15px;
        border-radius: 6px;
        background: #81b214;
        color: #f3f4ed;
    }

    .room-item {
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 10px;
        height: 110px;
        box-shadow: 2px 2px 3px 4px #cccccc;
    }

    .room-item.active {
        background-color: #ccffbd;
    }
</style>
