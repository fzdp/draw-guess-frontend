import Vue from "vue"
import store from "../store"
import Router from "vue-router"
import GameLobby from "../components/GameLobby"
import SignUp from "../components/SignUp"
import NewRoom from "../components/NewRoom"
import ShowRoom from "../components/ShowRoom"
import SignIn from "../components/SignIn"
import UserBlocked from "../components/UserBlocked"
import ResetPassword from "../components/ResetPassword";
import ResetPasswordForm from "../components/ResetPasswordForm";
import MyProfile from "../components/MyProfile";
import ScoreRecords from "../components/ScoreRecords";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/", name: "index", component: GameLobby
    },
    {
      path: "/sign_up", name: "sign_up", component: SignUp
    },
    {
      path: "/sign_in", name: "sign_in", component: SignIn
    },
    {
      path: "/new_room", name: "new_room", component: NewRoom,
      meta: {needLogin: true}
    },
    {
      path: "/r/:id", name: "show_room", component: ShowRoom,
      props: true,
      meta: {needLogin: true}
    },
    {
      path: "/blocked", name: "user_blocked", component: UserBlocked
    },
    {
      path: "/reset_password", name: "reset_password", component: ResetPassword
    },
    {
      path: "/reset_password/:email", name: "reset_password_form",
      props: true,
      component: ResetPasswordForm
    },
    {
      path: "/u", name: "profile", component: MyProfile, meta: {needLogin: true}
    },
    {
      path: "/score", name: "score_records", component: ScoreRecords,
      meta: {needLogin: true}
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(route => route.meta.needLogin)) {
    if (store.state.user) {
      next();
    } else {
      next({name: "sign_in", query: {redirect: to.fullPath}})
    }
  } else {
    next();
  }
});

export default router;
