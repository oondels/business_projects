<template>
  <div
    class="vh-100 d-flex justify-content-center align-items-center"
    :style="{
      backgroundImage: 'url(' + require('../../public/img/illustrations/sao-joao.jpg') + ')',
      backgroundSize: 'cover',
    }"
  >
    <v-stepper v-if="terminada" v-model="step" class="stepper vw-100 shadow-none transform-scale-md-7">
      <h1 class="text-center">Pesquisa junina</h1>
      <div v-if="aviso" class="px-4">
        <div class="px-4 fs-4 card rounded">
          <strong class="">Olá, queremos te ouvir!!!</strong> <br />
          <p class="fs-4 word-space-2">
            Neste mês de junho no período <strong class="text-bold">de 20 a 25/06</strong> teremos calendário de festas juninas na
            cidade de Santo Estevão, logo gostaríamos de ouvir sua opinião.
          </p>
        </div>
      </div>
      <v-stepper-header class="border-none small-shadow">
        <v-stepper-item class="fs-4" title="Selecione seu turno" :value="1" />
      </v-stepper-header>

      <v-stepper-window direction="vertical">
        <div class="col-12 d-flex justify-content-between">
          <v-btn
            @click="selecionaTurno('1° Turno')"
            class="col-2 font-weight-bold fs-6"
            :class="[{ 'bg-primary text-white': turno === '1° Turno', 'bg-dark text-white': turno !== '1° Turno' }]"
            >1° Turno</v-btn
          >
          <v-btn
            @click="selecionaTurno('2° Turno')"
            class="col-2 bg-dark font-weight-bold text-white fs-6"
            :class="[{ 'bg-primary text-white': turno === '2° Turno', 'bg-dark text-white': turno !== '2° Turno' }]"
            >2° Turno</v-btn
          >
          <v-btn
            @click="selecionaTurno('3° Turno')"
            class="col-2 bg-dark font-weight-bold text-white fs-6"
            :class="[{ 'bg-primary text-white': turno === '3° Turno', 'bg-dark text-white': turno !== '3° Turno' }]"
            >3° Turno</v-btn
          >
          <v-btn
            @click="selecionaTurno('Comercial')"
            class="col-2 bg-dark font-weight-bold text-white fs-6"
            :class="[{ 'bg-primary text-white': turno === 'Comercial', 'bg-dark text-white': turno !== 'Comercial' }]"
            >Comercial</v-btn
          >
        </div>
      </v-stepper-window>

      <v-stepper-header class="border-none small-shadow">
        <v-stepper-item class="fs-4" title="Opções de folga" :value="2" />
      </v-stepper-header>

      <v-stepper-window v-if="step > 1" direction="vertical">
        <div class="mb-6 py-4 rounded bg-white text-center">
          <h3 class="m-0">Você gostaria de realizar troca para quais dias durante o festejo junino?</h3>
        </div>
        <div class="col-12 d-flex justify-content-between mb-2">
          <div class="col-4 d-flex justify-content-start">
            <v-btn
              @click="
                selecionaDiaGozado('Não quero trocar');
                this.focoNoInput('matriculaField');
                step = 4;
                todosOsDias = false;
              "
              class="col-11 font-weight-bold text-white fs-6"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('Não quero trocar'),
                  'bg-danger text-white': !isSelecionado('Não quero trocar'),
                },
              ]"
              >Não quero trocar</v-btn
            >
          </div>

          <div class="col-4 d-flex justify-content-center">
            <v-btn
              @click="selecionaDiaGozado('20/06 (Quinta)')"
              class="col-11 font-weight-bold text-white fs-6 px-2"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('20/06 (Quinta)'),
                  'bg-dark text-white': !isSelecionado('20/06 (Quinta)'),
                },
              ]"
              >20/06 (Quinta)</v-btn
            >
          </div>

          <div class="col-4 d-flex justify-content-end">
            <v-btn
              @click="selecionaDiaGozado('21/06 (Sexta)')"
              class="col-11 font-weight-bold text-white fs-6 px-2"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('21/06 (Sexta)'),
                  'bg-dark text-white': !isSelecionado('21/06 (Sexta)'),
                },
              ]"
              >21/06 (Sexta)</v-btn
            >
          </div>
        </div>

        <div class="col-12 d-flex justify-content-between">
          <div class="col-4 d-flex justify-content-start">
            <v-btn
              @click="selecionaDiaGozado('25/06 (Terça)')"
              class="col-11 font-weight-bold text-white fs-6 px-2"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('25/06 (Terça)'),
                  'bg-dark text-white': !isSelecionado('25/06 (Terça)'),
                },
              ]"
              >25/06 (Terça)</v-btn
            >
          </div>

          <div v-if="turno === '2° Turno' || turno === '3° Turno'" class="col-4 d-flex justify-content-center">
            <v-btn
              @click="selecionaDiaGozado('20/06 (Quinta - Depois do jantar)')"
              class="col-11 font-weight-bold text-white fs-6 px-2"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('20/06 (Quinta - Depois do jantar)'),
                  'bg-dark text-white': !isSelecionado('20/06 (Quinta - Depois do jantar)'),
                },
              ]"
              >20/06 (Quinta - Depois do almoço)</v-btn
            >
          </div>

          <div v-if="turno === '1° Turno' || turno === 'Comercial'" class="col-4 d-flex justify-content-center">
            <v-btn
              @click="selecionaDiaGozado('25/06 (Terça - Até o almoço)')"
              class="col-11 font-weight-bold text-white fs-6 px-2"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('25/06 (Terça - Até o almoço)'),
                  'bg-dark text-white': !isSelecionado('25/06 (Terça - Até o almoço)'),
                },
              ]"
              >25/06 (Terça - Até o almoço)</v-btn
            >
          </div>

          <div class="col-4 d-flex justify-content-end">
            <v-btn
              @click="selecionaDiaGozado('Todos os dias')"
              class="col-11 font-weight-bold text-white fs-6"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('Todos os dias'),
                  'bg-dark text-white': !isSelecionado('Todos os dias'),
                },
              ]"
              >Todos os dias</v-btn
            >
          </div>
        </div>
      </v-stepper-window>

      <v-stepper-header class="border-none small-shadow">
        <v-stepper-item class="fs-4" title="Opções de compensação" :value="3" />
      </v-stepper-header>

      <v-stepper-window v-if="step > 2 && !nenhumDia" direction="vertical">
        <div class="mb-6 py-4 rounded bg-white text-center">
          <h3 class="m-0">
            {{ todosOsDias ? "Esses serão os dias de compensação:" : "Quais dias você preferiria trabalhar?" }}
          </h3>
        </div>

        <div class="col-12 d-flex justify-content-between mb-2">
          <div class="col-4 d-flex justify-content-start">
            <v-btn
              :disabled="nenhumDia || todosOsDias ? true : false"
              @click="
                selecionaDiaCompensacao('02/07 (Feriado)');
                (step = 4), this.focoNoInput('matriculaField');
              "
              class="col-11 font-weight-bold text-white fs-6"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('02/07 (Feriado)'),
                  'bg-dark text-white': !isSelecionado('02/07 (Feriado)'),
                },
              ]"
              >02/07 (Feriado)
            </v-btn>
          </div>

          <div class="col-4 d-flex justify-content-center">
            <v-btn
              :disabled="nenhumDia || todosOsDias ? true : false"
              @click="
                selecionaDiaCompensacao('15/06 (Sábado)');
                (step = 4), this.focoNoInput('matriculaField');
              "
              class="col-11 font-weight-bold text-white fs-6"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('15/06 (Sábado)'),
                  'bg-dark text-white': !isSelecionado('15/06 (Sábado)'),
                },
              ]"
              >15/06 (Sábado)
            </v-btn>
          </div>

          <div class="col-4 d-flex justify-content-end">
            <v-btn
              :disabled="nenhumDia || todosOsDias ? true : false"
              @click="
                selecionaDiaCompensacao('29/06 (Sábado)');
                (step = 4), this.focoNoInput('matriculaField');
              "
              class="col-11 font-weight-bold text-white fs-6"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('29/06 (Sábado)'),
                  'bg-dark text-white': !isSelecionado('29/06 (Sábado)'),
                },
              ]"
              >29/06 (Sábado)
            </v-btn>
          </div>
        </div>
        <div class="col-12 d-flex justify-content-between">
          <div class="col-3 d-flex justify-content-start">
            <v-btn @click="zerarVotacao" class="col-11 mb-4 bg-danger font-weight-bold text-white fs-6">Cancelar</v-btn>
          </div>

          <div v-if="!todosOsDias" class="col-3 d-flex justify-content-center">
            <v-btn
              :disabled="nenhumDia || todosOsDias ? true : false"
              @click="
                selecionaDiaCompensacao('15/06 (Meio período)');
                (step = 4), this.focoNoInput('matriculaField');
              "
              class="col-11 font-weight-bold text-white fs-6"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('15/06 (Meio período)'),
                  'bg-dark text-white': !isSelecionado('15/06 (Meio período)'),
                },
              ]"
              >15/06 (Meio período)
            </v-btn>
          </div>

          <div v-if="!todosOsDias" class="col-3 d-flex justify-content-center">
            <v-btn
              :disabled="nenhumDia || todosOsDias ? true : false"
              @click="
                selecionaDiaCompensacao('29/06 (Meio período)');
                (step = 4), this.focoNoInput('matriculaField');
              "
              class="col-11 font-weight-bold text-white fs-6"
              :class="[
                {
                  'bg-primary text-white': isSelecionado('29/06 (Meio período)'),
                  'bg-dark text-white': !isSelecionado('29/06 (Meio período)'),
                },
              ]"
              >29/06 (Meio período)
            </v-btn>
          </div>

          <div v-if="!todosOsDias" class="col-3 d-flex justify-content-end">
            <v-btn
              :disabled="nenhumDia || todosOsDias"
              @click="
                () => {
                  selecionaDiaCompensacao('Sábado Posterior');
                  step = 4;
                  focoNoInput('matriculaField');
                }
              "
              class="col-11 font-weight-bold text-white fs-6"
              :class="{
                'bg-primary text-white': isSelecionado('Sábado Posterior'),
                'bg-dark text-white': !isSelecionado('Sábado Posterior'),
              }"
            >
              Sábado Posterior
            </v-btn>
          </div>

          <div v-if="todosOsDias" class="col-3 d-flex justify-content-end">
            <v-btn
              class="col-11 mb-4 bg-success font-weight-bold text-white fs-6"
              @click="(step = 4), this.focoNoInput('matriculaField')"
              >Aceitar</v-btn
            >
          </div>
        </div>
      </v-stepper-window>

      <v-stepper-header class="border-none small-shadow">
        <v-stepper-item class="fs-4" title="Confirme com a sua matrícula" :value="4" />
      </v-stepper-header>

      <v-stepper-window v-if="step > 3" direction="vertical">
        <div class="mb-2 col-12 d-flex justify-content-between">
          <div class="col-5">
            <v-text-field
              type="number"
              :rules="matriculaRules"
              v-model="matricula"
              label="Número de Matrícula"
              ref="matriculaField"
              @keypress.enter="buscaColaboradorPelaMatricula(matricula)"
            >
            </v-text-field>
          </div>
          <span class="m-0 p-0 col-6 bg-warning text-center align-content-center fs-5"
            >A matrícula será usada apenas para o controle de votos</span
          >
        </div>
        <div class="col-12 d-flex justify-content-between">
          <div class="col-6">
            <v-btn @click="zerarVotacao" class="col-5 mb-4 bg-danger font-weight-bold text-white fs-6">Cancelar</v-btn>
          </div>
          <div class="col-6">
            <v-btn
              :disabled="!matricula"
              @click="buscaColaboradorPelaMatricula(matricula)"
              class="col-12 mb-4 bg-success font-weight-bold text-white fs-6"
              >Concluir</v-btn
            >
          </div>
        </div>
      </v-stepper-window>
      <app-footer />
    </v-stepper>

    <v-stepper v-model="step" class="stepper vw-100 shadow-none transform-scale-md-7">
      <h1 class="text-center">Votações encerradas</h1>
      <v-stepper-window direction="vertical">
        <h4 class="text-center">Obrigado por participar!</h4>
      </v-stepper-window>
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
</template>

<script>
import AppFooter from "@/examples/Footer.vue";
import axios from "axios";
import ip from "../ip";

export default {
  name: "informativo",

  computed: {
    isSelecionado() {
      return (opcao) => {
        return this.opcoesSelecionadas.includes(opcao);
      };
    },
  },

  data() {
    return {
      step: 0,

      terminada: false,

      turno: "",
      diaGozado: [],
      diaCompensacao: [],
      matricula: "",
      matriculaRules: [(value) => (value && value.length === 7) || "Insira seu crachá completo"],
      nome: "",
      gerente: "",
      setor: "",

      opcoesSelecionadas: [],

      todosOsDias: false,
      nenhumDia: false,
      aviso: true,

      dialogShown: false,
      corAlerta: "",
      iconeAlerta: "",
      tituloAlerta: "",
      mensagemAlerta: "",
    };
  },

  methods: {
    selecionaTurno(turno) {
      this.turno = turno;
      this.aviso = false;
      this.step = 2;
    },

    selecionaDiaGozado(diaGozado) {
      if (diaGozado === "Todos os dias") {
        this.diaGozado = [diaGozado];
        this.todosOsDias = true;
        this.nenhumDia = false;
        this.step = 3;
        this.atribuiMarcadorAoSelecionado(diaGozado);
        this.selecionaDiaCompensacao();
        return;
      }

      if (diaGozado === "Não quero trocar") {
        this.diaGozado = [diaGozado];
        this.todosOsDias = false;
        this.nenhumDia = true;
        this.step = 4;
        this.atribuiMarcadorAoSelecionado(diaGozado);
        this.selecionaDiaCompensacao();
        return;
      }

      this.diaGozado = this.diaGozado.filter((dia) => dia !== "Todos os dias" && dia !== "Não quero trocar");

      const index = this.diaGozado.indexOf(diaGozado);
      if (index > -1) {
        this.diaGozado.splice(index, 1);
      } else {
        this.diaGozado.push(diaGozado);
      }
      this.todosOsDias = false;
      this.nenhumDia = false;
      this.step = 3;
      this.atribuiMarcadorAoSelecionado(diaGozado);
    },
    selecionaDiaCompensacao(diaCompensacao) {
      if (this.diaGozado[0] === "Todos os dias") {
        this.diaCompensacao = ["Todos os dias"];
        return;
      }

      if (this.diaGozado[0] === "Não quero trocar") {
        this.diaCompensacao = ["Não quero trocar"];
        return;
      }

      this.diaCompensacao = this.diaCompensacao.filter((dia) => dia !== "Todos os dias" && dia !== "Não quero trocar");

      const index = this.diaCompensacao.indexOf(diaCompensacao);
      this.atribuiMarcadorAoSelecionado(diaCompensacao);
      if (index > -1) {
        this.diaCompensacao.splice(index, 1);
        return;
      }
      this.diaCompensacao.push(diaCompensacao);
    },

    atribuiMarcadorAoSelecionado(opcao) {
      if (opcao === "Todos os dias") {
        this.opcoesSelecionadas = [opcao];
        return;
      }

      if (opcao === "Não quero trocar") {
        this.opcoesSelecionadas = [opcao];
        return;
      }

      this.opcoesSelecionadas = this.opcoesSelecionadas.filter((dia) => dia !== "Todos os dias" && dia !== "Não quero trocar");

      const index = this.opcoesSelecionadas.indexOf(opcao);
      if (index > -1) {
        if (opcao === "Todos os dias") {
          this.opcoesSelecionadas = [];
        }
        this.opcoesSelecionadas.splice(index, 1);
        return false;
      } else {
        this.opcoesSelecionadas.push(opcao);
        return true;
      }
    },

    buscaColaboradorPelaMatricula(matricula) {
      axios.get(`http://${ip}:3041/buscaColaboradorPelaMatricula`, { params: { matricula: matricula } }).then((response) => {
        if (!response.data) {
          this.mostrarAlerta("danger", "fas fa-thumbs-down", "Erro", "Você pode ter inserido o crachá incorreto");
        } else {
          this.nome = response.data.nome;
          this.matricula = response.data.matricula;
          this.setor = response.data.nome_setor;
          this.gerente = response.data.gerente;
          this.concluir();
        }
      });
    },

    concluir() {
      if (!this.turno || !this.diaGozado || !this.diaCompensacao) {
        return this.mostrarAlerta("warning", "fas fa-exclamation", "Erro", "Você não informou todos os dados");
      }

      if (!this.matricula || !this.nome || !this.gerente || !this.setor) {
        return this.mostrarAlerta("danger", "fas fa-thumbs-down", "Erro", "Você pode ter inserido o crachá incorreto");
      }

      const pesquisa = {
        turno: this.turno,
        diaGozado: this.diaGozado,
        diaCompensacao: this.diaCompensacao,
        matricula: this.matricula,
        nome: this.nome,
        gerente: this.gerente,
        setor: this.setor,
      };

      axios
        .post(`http://${ip}:3041/salvaPesquisa`, {
          pesquisa,
        })
        .then((response) => {
          if (response.status === 200) {
            this.mostrarAlerta("success", "fas fa-thumbs-up", "Sucesso", "Obrigado por particiar da nossa pesquisa");
            this.zerarVotacao();
          }
        })
        .catch((error) => {
          console.error("Erro ao salvar voto: ", error);
          if (error.response.status !== 422) {
            this.zerarVotacao();
          }
          return this.mostrarAlerta("warning", "fas fa-exclamation", "Erro", error.response.data);
        });
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

    nextStep() {
      this.step++;
    },
    previousStep() {
      this.step--;
    },
    focoNoInput(refInput) {
      this.$nextTick(() => {
        this.$refs[refInput].focus();
      });
    },

    zerarVotacao() {
      this.step = 0;
      this.turno = "";
      this.diaGozado = [];
      this.diaCompensacao = [];
      this.opcoesSelecionadas = [];
      this.matricula = "";
      this.nome = "";
      this.gerente = "";
      this.setor = "";
      this.aviso = true;
    },
  },

  components: {
    AppFooter,
  },

  beforeMount() {
    this.$store.state.showNavbar = false;
    this.$store.state.showSidenav = false;
    this.$store.state.showFooter = false;
    this.$store.state.isTransparent = "bg-white";
  },
};
</script>

<style>
.stepper {
  background-color: #fffc !important;
}
</style>
