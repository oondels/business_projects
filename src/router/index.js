import { createRouter, createWebHashHistory } from "vue-router";

import Aplicacoes from "../views/Aplicacoes.vue";
import Inicio from "../views/Inicio.vue";
import SignIn from "../views/SignIn.vue";
import SignUp from "../views/SignUp.vue";

import FerramentasLean from "../views/FerramentasLean.vue";
import Informativo from "../views/Informativo.vue";
import InformativoResultado from "../views/InformativoResultado.vue";
import Manutencao from "../views/Manutencao.vue";
import PCP from "../views/PCP.vue";
import Point from "../views/Point.vue";
import Provisorio from "../views/Provisorio.vue";
import Quimico from "../views/Quimico.vue";
import Refeitorio from "../views/Refeitorio.vue";
import Reserva from "../views/Reserva.vue";
import TemposMetodos from "../views/TemposMetodos.vue";
import VotacaoPessoa from "../views/VotacaoPessoa.vue";

import VueJwtDecode from "vue-jwt-decode";
import BaixaProduto from "../views/BaixaProduto.vue";
import DepartamentoPessoal from "../views/DepartamentoPessoal.vue";
import Sorteio from "../views/Sorteio.vue";

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
    path: "/",
    name: "/",
    redirect: "inicio",
  },
  {
    path: "/inicio",
    name: "Início",
    component: Inicio,
  },
  {
    path: "/aplicacoes",
    name: "Aplicações",
    component: Aplicacoes,
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
    path: "/ferramentas-lean",
    name: "Ferramentas Lean",
    component: FerramentasLean,
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
    path: "/departamento-pessoal/provisorio",
    name: "Provisorio",
    component: Provisorio,
    meta: { requiresAuth: true, allowedSectors: ["AUTOMACAO", "DEPARTAMENTO PESSOAL"] },
  },

  {
    path: "/pcp",
    name: "PCP",
    component: PCP,
    meta: { requiresAuth: true, allowedSectors: ["AUTOMACAO", "PPCP"] },
  },

  {
    path: "/tempos&metodos",
    name: "Tempos & Métodos",
    component: TemposMetodos,
  },

  {
    path: "/tempos&metodos/point",
    name: "Point",
    component: Point,
  },

  {
    path: "/informativo",
    name: "Informativo",
    component: Informativo,
  },

  {
    path: "/informativo/resultado",
    name: "Resultado",
    component: InformativoResultado,
  },

  {
    path: "/quimico",
    name: "Químico",
    component: Quimico,
  },

  {
    path: "/sorteio",
    name: "Sorteio",
    component: Sorteio,
  },

  {
    path: "/departamento-pessoal",
    name: "Departamento Pessoal",
    component: DepartamentoPessoal,
  },

  {
    path: "/baixa-produto",
    name: "Baixa de produto",
    component: BaixaProduto,
  },

  {
    path: "/manutencao",
    name: "Manutencao - TPM de Máquinas",
    component: Manutencao,
  },

  {
    path: "/votacaoPessoa",
    name: "Votação",
    component: VotacaoPessoa,
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
      if (to.matched.some((record) => record.meta.allowedSectors.includes(userSetor) || userSetor === "AUTOMACAO")) {
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
