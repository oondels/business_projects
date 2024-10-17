import { createRouter, createWebHashHistory } from "vue-router";

import VueJwtDecode from "vue-jwt-decode";
import Aplicacoes from "../views/Aplicacoes.vue";
import CadastroUsuarios from "../views/CadastroUsuarios.vue";
import NotFound from "../views/NotFound.vue";
import Refeitorio from "../views/Refeitorio.vue";
import Reserva from "../views/Reserva.vue";
import SignIn from "../views/SignIn.vue";
import SignUp from "../views/SignUp.vue";

function decodeJwt() {
  let token = sessionStorage.getItem("token");
  if (token) {
    return VueJwtDecode.decode(token);
  }
  return null;
}

function isAutenticated() {
  return !!decodeJwt();
}

function getSetor() {
  const decoded = decodeJwt();
  return decoded ? decoded.setor : null;
}

const routes = [
  {
    path: "/aplicacoes",
    name: "Aplicações",
    component: Aplicacoes,
  },
  {
    path: "/cadastro-usuarios",
    name: "CadastroUsuarios",
    component: CadastroUsuarios,
  },

  {
    path: "/sign-in",
    name: "SignIn",
    component: SignIn,
  },

  {
    path: "/sign-up",
    name: "SignUp",
    component: SignUp,
  },

  {
    path: "/refeitorio",
    name: "Refeitório",
    component: Refeitorio,
  },

  {
    path: "/refeitorio/reserva",
    name: "Reserva",
    component: Reserva,
  },

  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkActiveClass: "active",
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAutenticated()) {
      next({ name: "SignIn" });
    } else {
      const userSetor = getSetor();
      if (
        to.matched.some(
          (record) =>
            record.meta.allowedSectors.includes(userSetor) ||
            userSetor === "AUTOMACAO"
        )
      ) {
        next();
      } else {
        next({ name: "Inicio" });
      }
    }
  } else {
    next();
  }
});

export default router;
