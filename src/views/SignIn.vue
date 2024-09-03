<template>
  <navbar btnBackground="bg-gradient-danger" />
  <div class="page-header align-items-start min-vh-100" :style="backgroundStyle">
    <span class="mask bg-gradient-dark opacity-6"></span>
    <div class="container my-auto">
      <div class="row">
        <div class="col-lg-4 col-md-8 col-12 mx-auto">
          <div class="card z-index-0 fadeIn3 fadeInBottom">
            <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
              <div class="bg-gradient-danger shadow-danger border-radius-lg py-3 pe-1">
                <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">Login</h4>
              </div>
            </div>
            <div class="card-body">
              <form class="text-start mt-3" @submit.prevent="signIn">
                <div class="mb-3">
                  <material-input
                    id="usuario"
                    type="usuario"
                    label="Usuário"
                    name="usuario"
                    @update:value="handleUsuarioChange"
                  />
                </div>
                <div class="mb-3">
                  <material-input
                    id="senha"
                    type="password"
                    label="Senha"
                    name="senha"
                    :value="senha"
                    @update:value="handleSenhaChange"
                  />
                </div>
                <span class="text-danger" v-if="mensagem">{{ mensagemExibida }}</span>

                <div class="text-center">
                  <material-button type="submit" class="my-4 mb-2" variant="gradient" color="danger" fullWidth
                    >Entrar</material-button
                  >
                </div>
                <p class="mt-4 text-sm text-center">
                  Esqueceu a senha?
                  <v-dialog max-width="400">
                    <template v-slot:activator="{ props: activatorProps }">
                      <span v-bind="activatorProps" @click="overlay = !overlay" class="text-danger text-gradient font-weight-bold"
                        >Recuperar</span
                      >
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-card class="container">
                        <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                          <div class="bg-gradient-danger shadow-danger border-radius-lg py-3 pe-1">
                            <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">Recuperar senha</h4>
                          </div>
                        </div>
                        <form class="text-start mt-3 container" @submit.prevent="recuperar">
                          <div class="mb-3">
                            <material-input
                              id="codigo"
                              type="codigo"
                              label="Código"
                              name="codigo"
                              @update:value="handleCodigoChange"
                            />
                          </div>
                          <div class="mb-3">
                            <material-input
                              id="novaSenha"
                              type="password"
                              label="Nova senha"
                              name="novaSenha"
                              @update:value="handleNovaSenhaChange"
                            />
                          </div>
                          <span class="text-danger" v-if="mensagem">{{ mensagemExibida }}</span>

                          <div class="text-center">
                            <material-button type="submit" class="my-4 mb-2" variant="gradient" color="danger" fullWidth
                              >Alterar</material-button
                            >
                            <material-button
                              type="button"
                              @click="isActive.value = false"
                              class="my-4 mb-2"
                              variant="gradient"
                              color="danger"
                              fullWidth
                              >Fechar</material-button
                            >
                          </div>
                        </form>
                      </v-card>
                    </template>
                  </v-dialog>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer position-absolute bottom-2 py-2 w-100">
      <div class="copyright text-center d-flex justify-content-center text-sm text-white text-lg-start">
        Desenvolvido por Dass SEST {{ new Date().getFullYear() }}&copy;
      </div>
    </footer>
  </div>
</template>

<script>
import MaterialButton from "@/components/MaterialButton.vue";
import MaterialInput from "@/components/MaterialInput.vue";
import Navbar from "@/examples/PageLayout/Navbar.vue";
import axios from "axios";
import { mapMutations } from "vuex";
import ip from "../ip";

export default {
  name: "sign-in",
  components: {
    Navbar,
    MaterialInput,
    MaterialButton,
  },
  beforeMount() {
    this.toggleEveryDisplay();
    this.toggleHideConfig();
  },
  beforeUnmount() {
    this.toggleEveryDisplay();
    this.toggleHideConfig();
  },
  data() {
    return {
      usuario: "",
      senha: "",
      codigo: 0,
      novaSenha: "",

      backgroundImageUrl: require("../../public/img/illustrations/back-fila.jpg"),

      mensagem: false,
      mensagemExibida: "",
    };
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url(${this.backgroundImageUrl})`,
      };
    },
  },
  methods: {
    handleUsuarioChange(newValue) {
      this.usuario = newValue;
    },

    handleSenhaChange(newValue) {
      this.senha = newValue;
    },

    handleCodigoChange(newValue) {
      this.codigo = newValue;
    },

    handleNovaSenhaChange(newValue) {
      this.novaSenha = newValue;
    },

    mostrarMensagem(mensagem) {
      this.mensagem = true;
      setTimeout(() => {
        this.mensagem = false;
      }, 5000);

      return mensagem;
    },

    ...mapMutations(["toggleEveryDisplay", "toggleHideConfig"]),
    signIn() {
      axios
        .post(`http://${ip}:3041/login`, {
          usuario: this.usuario,
          senha: this.senha,
        })
        .then((response) => {
          const token = response.data.data.token;
          sessionStorage.setItem("token", token);
          this.$router.push("/inicio");
        })
        .catch((error) => {
          this.mensagemExibida = this.mostrarMensagem("Usuário ou senha inválidos");
          console.error("Erro ao fazer o login: ", error.response);
        });
    },

    recuperar() {
      axios
        .post(`http://${ip}:3041/recuperar`, {
          codigo: this.codigo,
          novaSenha: this.novaSenha,
        })
        .then(() => {
          this.mensagemExibida = this.mostrarMensagem("Senha alterada com sucesso");
        })
        .catch((error) => {
          this.mensagemExibida = this.mostrarMensagem("Erro ao alterar a senha, tente novamente");
          console.error("Erro ao alterar a senha: ", error);
        });
    },
  },
};
</script>
