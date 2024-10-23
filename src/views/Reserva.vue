<template>
  <div
    class="vh-100 d-flex justify-content-center align-items-center"
    :style="{
      backgroundImage: 'url(' + require('../../public/img/vr-bg.png') + ')',
      backgroundSize: 'cover',
    }"
  >
    <v-stepper
      v-model="step"
      class="stepper vw-100 shadow-none transform-scale-md-7"
    >
      <v-stepper-header class="border-none small-shadow">
        <v-stepper-item class="fs-4" title="Reserva" :value="1" />
      </v-stepper-header>

      <transition name="fade">
        <v-stepper-window direction="vertical">
          <div class="col-12 d-flex justify-content-between">
            <v-btn
              @click="
                selectedOption = 'Lanche';
                step = 2;
              "
              class="col-5 bg-dark font-weight-bold text-white fs-5"
              >Lanche</v-btn
            >
            <v-btn
              @click="
                selectedOption = 'Light';
                step = 2;
              "
              class="col-5 bg-dark font-weight-bold text-white fs-5"
              >Light</v-btn
            >
          </div>
        </v-stepper-window>
      </transition>

      <v-stepper-header class="border-none small-shadow">
        <v-stepper-item
          class="fs-4"
          title="Termo de responsabilidade"
          :value="2"
        />
      </v-stepper-header>

      <transition name="fade">
        <v-stepper-window v-if="step > 1" direction="vertical" class="fade">
          <div class="bg-warning mb-4 text-center">
            <h2>Consumo consciente</h2>
            <p class="fs-4">
              Caso não seja consumido por motivos não justificados, a refeição
              será cobrada.
              <strong class="font-weight-bold text-dark"
                >Tem certeza que deseja reservar?</strong
              >
            </p>
          </div>
          <div class="col-12 d-flex justify-content-between">
            <div class="col-6">
              <v-btn
                @click="
                  selectedOption = '';
                  step = 1;
                "
                class="col-5 bg-primary font-weight-bold text-white fs-5"
                >Cancelar</v-btn
              >
            </div>
            <div class="col-6 d-flex justify-content-between">
              <v-btn
                @click="
                  selectedOption = '';
                  step = 1;
                "
                class="col-5 bg-danger font-weight-bold text-white fs-5"
                >Não</v-btn
              >
              <v-btn
                @click="(step = 3), this.focoNoInput('codigoRfidField')"
                class="col-5 bg-success font-weight-bold text-white fs-5"
                >Sim</v-btn
              >
            </div>
          </div>
        </v-stepper-window>
      </transition>

      <v-stepper-header class="border-none small-shadow">
        <v-stepper-item class="fs-4" title="Confirmação" :value="3" />
      </v-stepper-header>

      <transition name="fade">
        <v-stepper-window v-if="step > 2" direction="vertical">
          <div class="mb-2">
            <v-text-field
              type="password"
              :rules="codigoRfidRules"
              v-model="codigoRfid"
              ref="codigoRfidField"
              @keypress.enter="buscaColaboradorPeloRfid(codigoRfid)"
              label="Código do crachá"
            ></v-text-field>
            <v-text-field
              type="number"
              :rules="matriculaRules"
              v-if="!colaboradorExistente"
              v-model="matricula"
              label="Número de Matrícula"
              ref="matriculaField"
              @keypress.enter="buscaColaboradorPelaMatricula(matricula)"
            >
            </v-text-field>
          </div>
          <div class="col-12 d-flex justify-content-between">
            <div class="col-6">
              <v-btn
                @click="
                  selectedOption = '';
                  step = 1;
                "
                class="col-5 mb-4 bg-primary font-weight-bold text-white fs-5"
                >Cancelar</v-btn
              >
            </div>
            <div class="col-6">
              <v-btn
                :disabled="!matricula"
                @click="
                  buscaColaboradorPelaMatricula(matricula);
                  concluir();
                "
                class="col-12 mb-4 bg-success font-weight-bold text-white fs-5"
              >
                Concluir
              </v-btn>
            </div>
          </div>
        </v-stepper-window>
      </transition>
      <app-footer />
    </v-stepper>

    <v-dialog v-model="dialogShown" max-width="400">
      <v-card :color="corAlerta" dark>
        <v-card-title class="headline">
          <i :class="iconeAlerta"></i>
          {{ tituloAlerta }}
        </v-card-title>
        <v-card-text>
          {{ mensagemAlerta }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="dialogShown = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <alert ref="alert" />
</template>

<script>
import AppFooter from "@/examples/Footer.vue";
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../ip";
import Alert from "./components/Alert.vue";

const body = document.getElementsByTagName("body")[0];

export default {
  name: "reserva",
  components: {
    AppFooter,
    Alert,
  },

  data() {
    return {
      step: 0,
      selectedOption: "",
      codigoRfid: "",
      matricula: "",
      nomeColaborador: "",

      matriculaRules: [
        (value) =>
          (value && value.length === 7) || "Insira seu crachá completo",
      ],

      codigoRfidRules: [
        this.matricula ||
          "Parece que a sua matricula não consta em nossos registros"],

      colaboradorExistente: true,

      dialogShown: false,
      corAlerta: "",
      iconeAlerta: "",
      tituloAlerta: "",
      mensagemAlerta: "",
    };
  },
  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    buscaColaboradorPeloRfid(rfid) {
      axios
        .get(`http://${ip}:3048/buscaColaboradorPeloRfid`, {
          params: {
            rfid: rfid,
          },
        })
        .then((response) => {
          if (!response.data.matricula) {
            this.colaboradorExistente = false;
            this.$refs.alert.mostrarAlerta(
              "warning",
              "error",
              "Erro",
              "Colaborador não encontrado por aproximação, por favor insira a matrícula (COM O 30)."
            );
            this.focoNoInput("matriculaField");
          } else {
            this.colaboradorExistente = true;
            this.nomeColaborador = response.data.nome;
            this.matricula = response.data.matricula;
            this.concluir();
          }
        });
    },

    buscaColaboradorPelaMatricula(matricula) {
      axios
        .get(`http://${ip}:3048/buscaColaboradorPelaMatricula`, {
          params: {
            matricula: matricula,
            unidade: this.decodeJwt().unidade,
          },
        })
        .then((response) => {
          this.nomeColaborador = response.data.nome;
          console.log(response.data)
          return this.concluir()
        })
        .catch(error => {
          console.error(`Colaborador não encontrado, verifique matricula: ${error}`);
          return this.$refs.alert.mostrarAlerta(
              "warning",
              "error",
              "Erro",
              error.response.data.error
            );
        })
    },

    concluir() {
      if (!this.codigoRfid) {
        this.mostrarAlerta(
          "danger",
          "danger",
          "Erro",
          "Você precisa aproximar o crachá"
        );
      }

      if (this.matricula.length !== 7) {
        this.mostrarAlerta(
          "warning",
          "warning",
          "Erro",
          "Insira o crachá completo!"
        );
      }

      axios
        .post(`http://${ip}:3048/salvaReserva`, {
          matricula: Number(this.matricula),
          codigoRfid: this.codigoRfid,
          opcaoSelecionada: this.selectedOption,
        })
        .then((response) => {
          this.$refs.alert.mostrarAlerta(
              "success",
              "done_outlined",
              "Sucesso",
              response.data.message
            );

            setTimeout(() => {
              this.initialStep();
            }, 1000);
        })
        .catch((error) => {
          console.error(`Erro ao salvar reserva: ${error}`);
          return this.$refs.alert.mostrarAlerta(
              "warning",
              "error",
              "Erro",
              error.response.data.error
            );
        });
    },

    focoNoInput(refInput) {
      this.$nextTick(() => {
        this.$refs[refInput].focus();
      });
    },

    initialStep() {
      (this.colaboradorExistente = true), (this.step = 0);
      this.selectedOption = "";
      this.codigoRfid = "";
      this.matricula = "";
      this.nomeColaborador = "";
    },
    nextStep() {
      this.step++;
    },
    previousStep() {
      this.step--;
    },

    mostrarAlerta(cor, icone, titulo, mensagem) {
      this.corAlerta = cor;
      this.iconeAlerta = icone;
      this.tituloAlerta = titulo;
      this.mensagemAlerta = mensagem;
      this.dialogShown = true;

      setTimeout(() => {
        this.dialogShown = false;
      }, "2000");
      return;
    },
  },

  beforeMount() {
    this.$store.state.showNavbar = false;
    this.$store.state.showSidenav = false;
    this.$store.state.showFooter = false;
    body.classList.add("reserva");
    this.$store.state.isTransparent = "bg-white";
  },

  beforeUnmount() {
    this.$store.state.showNavbar = true;
    this.$store.state.showSidenav = true;
    this.$store.state.showFooter = true;
    body.classList.add("reserva");
    this.$store.state.isTransparent = true;
  },
};
</script>

<style>
.stepper {
  background-color: #00000012 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  height: 0;
}
</style>
