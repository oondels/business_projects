<template>
  <div
    class="vh-100 d-flex justify-content-center align-items-center"
    :style="{
      backgroundImage: 'url(' + require('../../public/img/vr-bg.png') + ')',
      backgroundSize: 'cover',
    }"
  >
    <div class="stepper rounded px-2 py-3 vw-100 shadow-none transform-scale-md-9">
      <h2 class="border-bottom mb-2">Sorteio</h2>
      <div class="col-12 row p-0 m-0 mb-2">
        <v-text-field
          type="number"
          class="col-2"
          label="Quantidade de ganhadores"
          v-model="sorteio.quantidadeGanhadores"
        ></v-text-field>
      </div>
      <div class="col-12 row mb-4">
        <div class="col-12 text-center">
          <v-btn class="fs-3 w-90" color="success" @click="defineGanhadores()" text="Sortear"></v-btn>
        </div>
        <v-dialog max-width="full-screen" v-model="modalContador" class="bg-white">
          <div v-if="!terminouContagem" class="d-flex justify-content-center align-items-center">
            <v-progress-circular :model-value="rotate" :rotate="90" :size="600" :width="15" color="danger">
              <span class="fs-1">{{ value }}</span>
            </v-progress-circular>
          </div>
          <v-card class="col-12 text-center" v-if="terminouContagem">
            <h4>Ganhadores</h4>
            <ul class="list-group">
              <li class="list-group-item" v-for="ganhador in ganhadoresImediatos" :key="ganhador.id">
                <div class="col-12 row">
                  <div class="col-1">
                    <span>{{ ganhador.matricula }}</span>
                  </div>
                  <div class="col-3">
                    <span>{{ ganhador.nome }}</span>
                  </div>
                  <div class="col-3">
                    <span>{{ ganhador.gerente }}</span>
                  </div>
                  <div class="col-3">
                    <span>{{ ganhador.setor }}</span>
                  </div>
                  <div class="col-2">
                    <span>{{ ganhador.evento }}</span>
                  </div>
                </div>
              </li>
            </ul>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                class="ms-auto"
                color="danger"
                text="Fechar"
                @click="
                  modalContador = false;
                  ganhadoresImediatos = [];
                "
              ></v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <div class="col-12">
        <div class="col-12 row mb-2">
          <h4 class="col-4">Todos os sorteados</h4>
          <div class="col-2">
            <v-select
              density="compact"
              variant="outlined"
              :items="filtrar.gerentes"
              label="Gerente"
              v-model="filtro.gerente"
              @update:modelValue="this.buscaGanhadores()"
            ></v-select>
          </div>
          <div class="col-2">
            <v-select
              density="compact"
              variant="outlined"
              :items="filtrar.setores"
              label="Setor"
              v-model="filtro.setor"
              @update:modelValue="this.buscaGanhadores()"
            ></v-select>
          </div>
          <div class="col-2">
            <v-select
              density="compact"
              variant="outlined"
              :items="['FALTA ZERO', 'PENSE & AJA']"
              label="Evento"
              v-model="filtro.evento"
              @update:modelValue="this.buscaGanhadores()"
            ></v-select>
          </div>
          <div class="col-2">
            <v-text-field
              density="compact"
              variant="outlined"
              type="date"
              label="Data do sorteio"
              v-model="filtro.dataSorteio"
              @update:modelValue="this.buscaGanhadores()"
            ></v-text-field>
          </div>
        </div>
        <ul class="list-group">
          <li class="list-group-item" v-for="ganhador in ganhadores" :key="ganhador.id">
            <div class="col-12 row">
              <div class="col-1">
                <span>{{ ganhador.matricula }}</span>
              </div>
              <div class="col-3">
                <span>{{ ganhador.nome }}</span>
              </div>
              <div class="col-3">
                <span>{{ ganhador.gerente }}</span>
              </div>
              <div class="col-3">
                <span>{{ ganhador.setor }}</span>
              </div>
              <div class="col-1">
                <span>{{ ganhador.evento }}</span>
              </div>
              <div class="col-1">
                <span>{{ ganhador.data_sorteio.split("T")[0] }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <app-footer />
    </div>
  </div>
</template>

<script>
import AppFooter from "@/examples/Footer.vue";
import axios from "axios";
import ip from "../ip";

const body = document.getElementsByTagName("body")[0];

export default {
  name: "Sorteio",
  components: {
    AppFooter,
  },

  data() {
    return {
      sorteio: {
        gerente: "",
        dataInicio: "",
        dataFinal: "",
        evento: "",
        quantidadeGanhadores: 0,
      },

      filtro: {
        gerente: "",
        dataSorteio: "",
        setor: "",
        evento: "",
      },

      filtrar: {},

      modalContador: false,
      terminouContagem: false,

      gerentes: [],
      ganhadores: [],
      ganhadoresImediatos: [],

      interval: {},
      value: 5,
      rotate: 0,
    };
  },

  mounted() {
    this.buscaGerentes();
    this.buscaGanhadores();
    this.obterDataAtualFormatada();
    this.buscaFiltros();
  },

  methods: {
    contagem() {
      this.terminouContagem = false;
      this.value = 5;
      this.rotate = 0;

      this.interval = setInterval(() => {
        if (this.value === 0) {
          this.terminouContagem = true;
          return clearInterval(this.interval);
        }
        this.value -= 1;
        this.rotate += 20;
      }, 1000);
    },

    obterDataAtualFormatada() {
      const dataAtual = new Date();
      const ano = dataAtual.getFullYear();
      const mes = String(dataAtual.getMonth() + 1).padStart(2, "0"); // Janeiro é 0!
      const dia = String(dataAtual.getDate()).padStart(2, "0");

      this.filtro.dataSorteio = `${ano}-${mes}-${dia}`;
    },

    buscaGerentes() {
      this.sorteio.evento = "FALTA 0";
      axios
        .get(`http://${ip}:3041/buscaGerentes`)
        .then((response) => {
          this.gerentes = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar gerentes: " + error.response.status);
        });
    },

    defineGanhadores() {
      this.modalContador = true;
      this.contagem();
      axios
        .post(`http://${ip}:3041/ganhadores`, {
          sorteio: this.sorteio,
        })
        .then((response) => {
          this.ganhadoresImediatos = response.data;
          this.buscaGanhadores();
        })
        .catch((error) => {
          console.error("Erro ao salvar ganhadores: " + error.response.status);
        });
    },

    buscaFiltros() {
      axios
        .get(`http://${ip}:3041/filtros`)
        .then((response) => {
          this.filtrar = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar filtros: " + error.response.status);
        });
    },

    buscaGanhadores() {
      axios
        .get(`http://${ip}:3041/ganhadores`, { params: { filtro: this.filtro } })
        .then((response) => {
          this.ganhadores = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar ganhadores: " + error.response.status);
        });
    },
  },

  beforeMount() {
    this.$store.state.showNavbar = false;
    this.$store.state.showSidenav = false;
    this.$store.state.showFooter = false;
    body.classList.add("reserva");
    this.$store.state.isTransparent = "bg-white";

    clearInterval(this.interval);
  },
};
</script>

<style scoped>
.list-group {
  overflow-y: auto;
  max-height: 300px;
}

.v-progress-circular {
  margin: 1rem;
}

.v-overlay__scrim {
  opacity: var(--v-overlay-opacity, 0.95) !important;
}
</style>
