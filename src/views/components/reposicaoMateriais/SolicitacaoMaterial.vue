<template>
  <div
    :class="
      selectedModel ? 'container-solicitação-flex' : 'container-solicitação'
    "
  >
    <div class="selections-reposicao">
      <div
        class="row col-12 d-flex flex-column justify-content-center align-items-center container-content mb-4"
      >
        <div
          class="title d-flex flex-row align-items-center justify-content-center"
        >
          <img src="img/aplicacoes/reposicao-material.png" alt="" />
          <h4 class="text-center">Solicitação de Reposição de Material</h4>
        </div>

        <v-combobox
          class="col-6 p-2"
          :items="models"
          item-title="nome"
          item-value="id"
          v-model="selectedModel"
          variant="solo"
          label="Modelo"
          @update:modelValue="
            getPecas();
            formatModelImageName(selectedModel);
          "
          clearable
        ></v-combobox>

        <v-combobox
          class="col-6 p-2"
          :disabled="!selectedModel"
          variant="solo"
          :items="pecas"
          item-title="nome"
          item-value="id"
          label="Peças"
          v-model="selectedPecas"
          clearable
          chips
          multiple
        ></v-combobox>

        <RelatorioReposicao
          v-if="selectedModel && selectedPecas.length"
          :model="selectedModel"
          :pecas="selectedPecas"
        />
      </div>

      <div
        v-if="modelImgName"
        class="model-pecas-image d-flex flex-column justify-content-center align-items-center"
      >
        <img
          :src="'img/reposicao_materiais/' + modelImgName + '.png'"
          alt="Peças do modelo selecionado"
        />
      </div>
    </div>

    <div v-if="!selectedModel" class="reposicao-info">
      <v-card
        append-icon="mdi-check"
        class="mx-auto mb-3"
        prepend-icon="mdi-file-document-outline"
        :subtitle="'Solicitações ' + currentMonth()"
        title="Solicitações de Peças"
      >
        <v-card-text>
          <div class="d-flex flex-column">
            <span class="finished-solicitations solicitation-info">
              35 Solicitações Concluídas
            </span>
            <span class="pending-solicitations solicitation-info">
              10 Solicitações Pendentes
            </span>
          </div>
        </v-card-text>
      </v-card>

      <ChartApex :chartData="chartData" :titleChart="'Solicitações'" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ChartApex from "../../../examples/Charts/ChartApex.vue";
import ip from "../../../ip";
import RelatorioReposicao from "./RelatorioReposicao.vue";

export default {
  name: "SolicitacaoMaterial",

  data() {
    return {
      models: [],
      selectedModel: null,
      modelImgName: "",

      pecas: [],
      selectedPecas: [],

      chartData: {
        chartOptions: {
          chart: {
            id: "supply-consumption",
          },

          stroke: {
            width: 5,
            curve: "smooth",
          },

          xaxis: {
            categories: ["Jan", "Feb", "Mar", "Abr", "Jun"],
          },
        },

        chartSeries: [
          {
            name: "Solicitações Concluídas",
            data: [10, 20, 8, 25, 15],
          },
          {
            name: "Solicitações Realizadas",
            data: [11, 20, 15, 22, 15],
          },
        ],
      },
    };
  },

  components: { RelatorioReposicao, ChartApex },

  mounted() {
    this.getAllModels();
  },

  methods: {
    getAllModels() {
      axios
        .get(`http://${ip}:3023/get-all-models`, {
          params: {
            unidade: "SEST",
          },
        })
        .then((response) => {
          response.data.forEach((model) => {
            this.models.push(model);
          });
        })
        .catch((error) => {
          console.error("Erro ao buscar modelos: ", error);
        });
    },

    currentMonth() {
      const date = new Date();
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      return monthNames[date.getMonth()];
    },

    formatModelImageName(selectedModel) {
      if (selectedModel) {
        const model = this.models.find(
          (model) => model.id === selectedModel.id
        );
        this.modelImgName = model.nome.split(" ").join("_");

        return this.modelImgName;
      }

      this.modelImgName = "";
      return this.modelImgName;
    },

    getPecas() {
      if (this.selectedModel) {
        axios
          .get(`http://${ip}:3023/get-pecas/${this.selectedModel}`)
          .then((response) => {
            if (response) {
              return response.data.forEach((peca) => {
                this.pecas.push(peca);
              });
            }
          })
          .catch((error) => {
            return console.error("Erro ao buscar modelos: ", error);
          });
      }

      this.pecas = [];
    },
  },
};
</script>

<style scoped>
.container-solicitação {
  width: 100%;
  display: grid;
  grid-template-columns: 500px auto;
}

.container-solicitação-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

.reposicao-info {
  width: 100%;
  margin-right: 10px;
  padding-right: 20px;
  box-shadow: 0 1rem 2rem rgba(68, 71, 90, 0.12);
  transition: all ease-in-out 0.2s;
}

.reposicao-info:hover {
  box-shadow: none;
}

.solicitation-info {
  border-radius: 10px;
  padding: 5px;
  text-align: center;
}

.finished-solicitations {
  background-color: #ecf8f2;
}

.pending-solicitations {
  background-color: #fbeee6;
}

.model-pecas-image img {
  width: 700px;
}

.container-content {
  background-color: #ecf8f2;
  border-radius: 15px;
  box-shadow: 0 1rem 2rem rgba(68, 71, 90, 0.12);
  transition: all ease-in-out 0.2s;
  max-width: 800px;
}

.container-content:hover {
  box-shadow: 0 4px 1px rgba(68, 71, 90, 0.12);
}

.title img {
  width: 100px;
  padding: 10px;
}

@media screen and (max-width: 900px) {
  .container-solicitação {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .selections-reposicao {
    width: 100%;
  }
}
</style>
