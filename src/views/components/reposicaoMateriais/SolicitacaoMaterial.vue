<template>
  <div
    class="container-solicitação d-flex flex-column justify-content-center align-items-center"
  >
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
</template>

<script>
import axios from "axios";
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
    };
  },

  components: { RelatorioReposicao },

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
.model-pecas-image img {
  width: 700px;
}

.container-content {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
}

.title img {
  width: 100px;
  padding: 10px;
}
</style>
