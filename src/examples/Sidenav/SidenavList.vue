<template>
  <div class="w-auto h-auto collapse navbar-collapse max-height-vh-100" id="sidenav-collapse-main">
    <ul class="navbar-nav">
      <li class="nav-item">
        <sidenav-collapse url="#" :aria-controls="''" v-bind:collapse="false" collapseRef="inicio" navText="Início">
          <template v-slot:icon>
            <i class="material-icons-round opacity-10 fs-5">home</i>
          </template>
        </sidenav-collapse>
      </li>
      <li class="nav-item">
        <sidenav-collapse url="#" :aria-controls="''" v-bind:collapse="false" collapseRef="aplicacoes"
          navText="Aplicações e Dashboards">
          <template v-slot:icon>
            <i class="material-icons-round opacity-10 fs-5">apps</i>
          </template>
        </sidenav-collapse>
      </li>
      <li class="mt-3 nav-item">
        <h6 class="text-xs ps-4 text-uppercase font-weight-bolder text-white"
          :class="$store.state.isRTL ? 'me-4' : 'ms-2'">
          GERENCIAMENTO DA CONTA
        </h6>
      </li>

      <li class="nav-item" @click="limpaSessao()">
        <sidenav-collapse url="#" :aria-controls="''" v-bind:collapse="false" collapseRef="sign-in" navText="Login">
          <template v-slot:icon>
            <i class="material-icons-round opacity-10 fs-5">login</i>
          </template>
        </sidenav-collapse>
      </li>
      <!-- <li class="nav-item">
        <sidenav-collapse url="#" :aria-controls="''" v-bind:collapse="false" collapseRef="sign-up"
          navText="Solicitar conta">
          <template v-slot:icon>
            <i class="material-icons-round opacity-10 fs-5">assignment</i>
          </template>
        </sidenav-collapse>
      </li> -->
    </ul>
  </div>
</template>
<script>

import SidenavCollapse from "./SidenavCollapse.vue";

export default {
  name: "SidenavList",
  props: {
    cardBg: String,
  },
  data() {
    return {
      title: "Soft UI Dashboard PRO",
      controls: "dashboardsExamples",
      isActive: "active",
    };
  },
  methods: {
    limpaSessao() {
      sessionStorage.clear();
    }
  },
  components: {
    SidenavCollapse,
  },
};
</script>
