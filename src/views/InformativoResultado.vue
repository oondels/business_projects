<template>
  <div class="container-fluid">
    <div class="card rounded p-2 mt-1 mb-3">
      <div class="col-12 row mb-2">
        <div class="col-4">
          <span>Votações totais: {{ resultadosTotais.total_votacao }}</span>
        </div>
        <div class="col-2 text-center">
          <span>Comercial: {{ resultadosTotais.total_comercial }}</span>
        </div>
        <div class="col-2 text-center">
          <span>1° Turno: {{ resultadosTotais.total_turno1 }}</span>
        </div>
        <div class="col-2 text-center">
          <span>2° Turno: {{ resultadosTotais.total_turno2 }}</span>
        </div>
        <div class="col-2 text-center">
          <span>3° Turno: {{ resultadosTotais.total_turno3 }}</span>
        </div>
      </div>
      <h5>{{ `Ultima atualização: ${horaAtualizacao}` }}</h5>
      <v-btn @click="atualizarDados()">Atualizar Dados</v-btn>
    </div>
    <h4>Quantidade de votos</h4>
    <div class="card z-index-2 mb-5">
      <div class="col-12 mb-2 px-2">
        <div class="rounded bg-gradient-success">
          <h5 class="text-center m-0 p-0">Votos</h5>
          <reports-bar-chart v-if="mostrarQuantidadeVotos" :id="'votos'" :chart="quantidadeVotos" />
        </div>
      </div>
    </div>

    <h4>Resultados gerais</h4>

    <div class="card z-index-2 mb-5">
      <div class="col-12 mb-2 px-2">
        <div class="rounded bg-gradient-success">
          <h5 class="text-center m-0 p-0">Opções gerais</h5>
          <reports-bar-chart v-if="mostrarGeral" :id="'gerais'" :chart="dadosGerais" />
        </div>
      </div>
    </div>

    <h4>Resultados totais</h4>

    <div class="col-12 m-0 card rounded mb-3 p-0 py-2">
      <div class="col-12 mb-2 px-2">
        <div class="rounded bg-gradient-secondary">
          <h5 class="text-center m-0 p-0">Folgas</h5>
          <reports-bar-chart v-if="mostrarTotal" :id="'folgaTotal'" :chart="folgaTotal" />
        </div>
      </div>
      <div class="col-12 px-2">
        <div class="rounded bg-gradient-info">
          <h5 class="text-center m-0 p-0">Compensação</h5>
          <reports-bar-chart v-if="mostrarTotal" :id="'compensacaoTotal'" :chart="compensacaoTotal" />
        </div>
      </div>
    </div>

    <h4>Resultados por turno</h4>
    <div class="col-12 row p-0 m-0">
      <div class="col-6 row m-0 mb-2 p-0 py-2 card rounded">
        <h5 class="text-center m-0 p-0">Turno Comercial</h5>
        <div class="col-12 px-2 mb-2">
          <div class="rounded bg-gradient-secondary">
            <h5 class="text-center m-0 p-0">Folgas</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'folgaComercial'" :chart="folgaComercial" />
          </div>
        </div>
        <div class="col-12 px-2">
          <div class="rounded bg-gradient-info">
            <h5 class="text-center m-0 p-0">Compensação</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'compensacaoComercial'" :chart="compensacaoComercial" />
          </div>
        </div>
      </div>

      <div class="col-6 row m-0 mb-2 p-0 py-2 card rounded">
        <h5 class="text-center m-0 p-0">1° Turno</h5>
        <div class="col-12 px-2 mb-2">
          <div class="rounded bg-gradient-secondary">
            <h5 class="text-center m-0 p-0">Folgas</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'folgaTurno1'" :chart="folgaTurno1" />
          </div>
        </div>
        <div class="col-12 px-2">
          <div class="rounded bg-gradient-info">
            <h5 class="text-center m-0 p-0">Compensação</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'compensacaoTurno1'" :chart="compensacaoTurno1" />
          </div>
        </div>
      </div>

      <div class="col-6 row m-0 mb-2 p-0 py-2 card rounded">
        <h5 class="text-center m-0 p-0">2° Turno</h5>
        <div class="col-12 px-2 mb-2">
          <div class="rounded bg-gradient-secondary">
            <h5 class="text-center m-0 p-0">Folgas</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'folgaTurno2'" :chart="folgaTurno2" />
          </div>
        </div>
        <div class="col-12 px-2">
          <div class="rounded bg-gradient-info">
            <h5 class="text-center m-0 p-0">Compensação</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'compensacaoTurno2'" :chart="compensacaoTurno2" />
          </div>
        </div>
      </div>

      <div class="col-6 row m-0 mb-2 p-0 py-2 card rounded">
        <h5 class="text-center m-0 p-0">3° Turno</h5>
        <div class="col-12 px-2 mb-2">
          <div class="rounded bg-gradient-secondary">
            <h5 class="text-center m-0 p-0">Folgas</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'folgaTurno3'" :chart="folgaTurno3" />
          </div>
        </div>
        <div class="col-12 px-2">
          <div class="rounded bg-gradient-info">
            <h5 class="text-center m-0 p-0">Compensação</h5>
            <reports-bar-chart v-if="mostrarParcial" :id="'compensacaoTurno3'" :chart="compensacaoTurno3" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReportsBarChart from "@/examples/Charts/ReportsBarChart.vue";
import axios from "axios";
import ip from "../ip";

export default {
  data() {
    return {
      compensacaoTurno2: {},
      compensacaoComercial: {},
      compensacaoTurno1: {},
      compensacaoTurno3: {},
      folgaTurno2: {},
      folgaComercial: {},
      folgaTurno1: {},
      folgaTurno3: {},

      compensacaoTotal: {},
      folgaTotal: {},

      dadosGerais: {},
      quantidadeVotos: {},

      mostrarParcial: false,
      mostrarTotal: false,
      mostrarGeral: false,
      mostrarQuantidadeVotos: false,

      horaAtualizacao: "",
      resultadosTotais: {},
    };
  },
  components: { ReportsBarChart },
  mounted() {
    this.buscaPesquisaParcial();
    this.buscaPesquisaTotal();
    this.atribuiHoraAtualizacao();
    this.buscaTotaiasVotacao();
    this.buscaDadosGerais();
    this.buscaQuantidadeVotos();
  },
  methods: {
    atualizarDados() {
      window.location.reload();
    },

    atribuiHoraAtualizacao() {
      const date = new Date();

      let hora = date.getHours();
      let minutos = date.getMinutes();
      let segundos = date.getSeconds();

      this.horaAtualizacao = `${hora}:${minutos}:${segundos}`;
    },
    buscaPesquisaParcial() {
      axios
        .get(`http://${ip}:3041/buscaPesquisaParcial`)
        .then((response) => {
          this.compensacaoTurno1 = response.data[0].compensacaoTurno1;
          this.compensacaoTurno2 = response.data[1].compensacaoTurno2;
          this.compensacaoTurno3 = response.data[2].compensacaoTurno3;
          this.compensacaoComercial = response.data[3].compensacaoComercial;

          this.folgaTurno1 = response.data[4].folgaTurno1;
          this.folgaTurno2 = response.data[5].folgaTurno2;
          this.folgaTurno3 = response.data[6].folgaTurno3;
          this.folgaComercial = response.data[7].folgaComercial;

          this.mostrarParcial = true;
        })
        .catch((error) => {
          console.error("Erro ao buscar pesquisa: ", error.message);
        });
    },
    buscaPesquisaTotal() {
      axios
        .get(`http://${ip}:3041/buscaPesquisaTotal`)
        .then((response) => {
          this.compensacaoTotal = response.data[0].compensacaoTotal;
          this.folgaTotal = response.data[1].folgaTotal;

          this.mostrarTotal = true;
        })
        .catch((error) => {
          console.error("Erro ao buscar pesquisa: ", error.message);
        });
    },

    buscaTotaiasVotacao() {
      axios.get(`http://${ip}:3041/buscaTotaisVotacao`).then((response) => {
        this.resultadosTotais = response.data;
      });
    },

    buscaDadosGerais() {
      axios.get(`http://${ip}:3041/buscaDadosGerais`).then((response) => {
        this.dadosGerais = response.data;

        this.mostrarGeral = true;
      });
    },

    buscaQuantidadeVotos() {
      axios.get(`http://${ip}:3041/buscaQuantidadeVotos`).then((response) => {
        this.quantidadeVotos = response.data;

        this.mostrarQuantidadeVotos = true;
      });
    },
  },

  beforeMount() {
    this.$store.state.showNavbar = false;
    this.$store.state.showSidenav = false;
    this.$store.state.showFooter = false;
    this.$store.state.isTransparent = "bg-white";
  },
};
</script>
