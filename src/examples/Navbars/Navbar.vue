<template>
  <nav class="shadow-none navbar navbar-main navbar-expand-lg border-radius-xl" v-bind="$attrs" id="navbarBlur"
    data-scroll="true" :class="isAbsolute ? 'mt-4' : 'mt-0'">
    <div class="px-3 py-1 container-fluid">
      <breadcrumbs :currentPage="currentRouteName" :color="color" />
      <div class="mt-2 collapse navbar-collapse mt-sm-0 me-md-0 me-sm-4 d-flex justify-content-end"
        :class="isRTL ? 'px-0' : 'me-sm-4'" id="navbar">
        <ul class="navbar-nav justify-content-end">
          <li class="form-check form-switch px-3 nav-item d-flex align-items-center">
            <input class="nav-link lh-1 p-0 form-check-input mt-1 ms-auto" type="checkbox"
              :checked="$store.state.isDarkMode" @click="darkMode" />
          </li>
          <v-dialog max-width="400">
            <template v-slot:activator="{ props: activatorProps }">
              <div v-bind="activatorProps" class="px-0 nav-link font-weight-bold lh-1 cursor-pointer"
                :class="verificaLogin() ? 'text-success' : 'text-danger'">
                <i class="material-icons" :class="isRTL ? 'ms-sm-2' : 'me-sm-1'">
                  account_circle
                </i>
              </div>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card class="p-3" v-if="verificaLogin()">
                <v-card-title class="bg-danger d-flex rounded text-white text-center text-bold">
                  <span>Sessão atual</span>
                  <v-spacer></v-spacer>
                  <i class="material-icons cursor-pointer align-content-center m-0"
                    @click="isActive.value = false">cancel</i>
                </v-card-title>
                <v-card-text class="text-center">
                  <span>{{ decodeJwt().usuario }}</span>
                </v-card-text>
                <div class="text-center">
                  <material-button type="submit" class="my-4 mb-2" variant="gradient" color="danger"
                    @click="limpaSessao()" fullWidth>Sair</material-button>
                </div>
              </v-card>
              <v-card class="p-3" v-if="!verificaLogin()">
                <v-card-title class="bg-danger d-flex rounded text-white text-center text-bold">
                  <span>Login</span>
                  <v-spacer></v-spacer>
                  <i class="material-icons cursor-pointer align-content-center m-0"
                    @click="isActive.value = false">cancel</i>
                </v-card-title>
                <v-card-text>
                  <form class="text-start mt-3" @submit.prevent="signIn">
                    <div class="mb-3">
                      <v-text-field variant="outlined" type="user" label="Usuário" v-model="usuario" />
                    </div>
                    <div class="mb-3">
                      <v-text-field variant="outlined" type="password" label="Senha" v-model="senha" />
                    </div>
                    <div class="text-center">
                      <material-button type="submit" class="my-4 mb-2" variant="gradient" color="danger"
                        fullWidth>Entrar</material-button>
                    </div>
                    <p class="mt-4 text-sm text-center">
                      Esqueceu a senha?
                      <v-dialog max-width="400">
                        <template v-slot:activator="{ props: activatorProps }">
                          <span v-bind="activatorProps" @click="overlay = !overlay"
                            class="text-danger text-gradient font-weight-bold">Recuperar</span>
                        </template>

                        <template v-slot:default="modalRecuperar">
                          <v-card class="container">
                            <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                              <div class="bg-gradient-danger shadow-danger border-radius-lg py-3 pe-1">
                                <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">
                                  Recuperar senha
                                </h4>
                              </div>
                            </div>
                            <form class="text-start mt-3 container" @submit.prevent="recuperar">
                              <div class="mb-3">
                                <v-text-field variant="outlined" type="number" label="Código" v-model="codigo" />
                              </div>
                              <div class="mb-3">
                                <v-text-field variant="outlined" type="password" label="Nova senha"
                                  v-model="novaSenha" />
                              </div>

                              <div class="text-center">
                                <material-button type="submit" class="my-4 mb-2" variant="gradient" color="danger"
                                  fullWidth>Alterar</material-button>
                                <material-button type="button" @click="modalRecuperar.isActive.value = false"
                                  class="my-4 mb-2" variant="gradient" color="danger" fullWidth>Fechar</material-button>
                              </div>
                            </form>
                          </v-card>

                        </template>
                      </v-dialog>
                    </p>
                  </form>
                </v-card-text>
              </v-card>
            </template>
          </v-dialog>
          <li class="nav-item d-xl-none ps-3 d-flex align-items-center">
            <div @click="toggleSidebar" class="p-0 nav-link text-body lh-1" id="iconNavbarSidenav">
              <div class="sidenav-toggler-inner">
                <i class="sidenav-toggler-line"></i>
                <i class="sidenav-toggler-line"></i>
                <i class="sidenav-toggler-line"></i>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <alert ref="alert" />

</template>
<script>
import Breadcrumbs from "../Breadcrumbs.vue";
import MaterialButton from "@/components/MaterialButton.vue";
import { mapMutations, mapState } from "vuex";
import { activateDarkMode, deactivateDarkMode } from "@/assets/js/dark-mode";
import axios from "axios";
import ip from "@/ip";
import Alert from "@/views/components/Alert.vue";
import VueJwtDecode from 'vue-jwt-decode';

export default {
  name: "navbar",
  data() {
    return {
      showMenu: false,
      modalRecuperar: false,

      usuario: '',
      senha: '',
      codigo: '',
      novaSenha: '',
    };
  },
  mounted() {
    this.verificaLogin();
  },
  props: ["minNav", "color"],
  created() {
    this.minNav;
  },
  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem('token');
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    limpaSessao() {
      sessionStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    },
    verificaLogin() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return true;
      } else {
        return false;
      }
    },

    ...mapMutations(["navbarMinimize", "toggleConfigurator"]),

    signIn() {
      axios.post(`http://${ip}:3050/login`, {
        usuario: this.usuario,
        senha: this.senha
      })
        .then(response => {
          const token = response.data.data.token;
          sessionStorage.setItem('token', token);
          window.location.reload();
        })
        .catch(error => {
          this.$refs.alert.mostrarAlerta('warning', 'fas fa-exclamation', 'Erro', error.response.data)
          console.error('Erro ao fazer o login: ', error.response);
        });
    },

    recuperar() {
      axios.post(`http://${ip}:3050/recuperar`, {
        codigo: this.codigo,
        novaSenha: this.novaSenha
      })
        .then((response) => {
          this.$refs.alert.mostrarAlerta('success', 'fas fa-exclamation', 'Sucesso', response.data)
          this.codigo = '';
          this.novaSenha = ''
        })
        .catch(error => {
          this.$refs.alert.mostrarAlerta('warning', 'fas fa-exclamation', 'Erro', error.response.data)
          console.error('Erro ao alterar a senha: ', error);
        })
    },

    darkMode() {
      if (this.$store.state.isDarkMode) {
        this.$store.state.isDarkMode = false;
        deactivateDarkMode();
        return;
      } else {
        this.$store.state.isDarkMode = true;
        activateDarkMode();
      }
    },

    toggleSidebar() {
      this.navbarMinimize();
    },
  },
  components: {
    Breadcrumbs,
    MaterialButton,
    Alert,
  },
  computed: {
    ...mapState(["isRTL", "isAbsolute"]),

    currentRouteName() {
      return this.$route.name;
    },
  },
};
</script>