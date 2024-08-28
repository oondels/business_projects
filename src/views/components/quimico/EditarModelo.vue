<template>
  <v-dialog max-width="900">
    <template v-slot:activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
        <mini-statistics-card
          :title="{ text: 'Alteração de Modelo' }"
          :icon="{
            name: 'edit_note',
            color: 'text-white',
            background: 'primary',
          }"
        />
      </div>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="text-center border-bottom position-sticky fixed-top border-bottom bg-white">
          <h3>Alteração de Modelo</h3>
        </v-card-title>

        <v-card-item>
          <div class="col-12 row mb-2">
            <div class="col-4">
              <select class="styled-select" name="modelo" id="modelo" v-model="newModelo.modeloSelecionado">
                <option name="modelo" value="" disabled selected>Escolha um Modelo</option>
                <option
                  v-for="(modelo, modeloId) in modelosCadastrados"
                  :key="modeloId"
                  class="styled-select"
                  name="modelo"
                  id="modelo"
                  :value="modelo.id"
                >
                  {{ modelo.modelo }}
                </option>
              </select>
            </div>

            <div class="col-4">
              <v-text-field type="text" label="Nome do modelo" v-model="newModelo.modelo"></v-text-field>
            </div>

            <div class="col-4">
              <v-select
                :items="['Montagem', 'Pré fabricado', 'Serigrafia']"
                label="Processo"
                v-model="newModelo.processo"
              ></v-select>
            </div>

            <div class="col-4">
              <v-select :items="['Fila', 'Nike']" label="Marca" v-model="newModelo.marca"></v-select>
            </div>
          </div>
          <div v-for="(produto, produtoIndex) in newModelo.produto" :key="produtoIndex" class="col-12 row mb-2">
            <div class="col-4">
              <v-text-field type="text" label="Nome do produto" v-model="produto.produto"></v-text-field>
            </div>

            <div class="col-4">
              <v-text-field type="number" label="Consumo prévio" v-model="produto.consumoPrevio"></v-text-field>
            </div>

            <div class="col-4">
              <v-text-field type="number" label="Preço por KG" v-model="produto.precoKg"></v-text-field>
            </div>

            <div class="col-4">
              <v-select :items="['Água', 'Solvente']" label="Base do produto" v-model="produto.base"></v-select>
            </div>

            <div class="col-4">
              <v-text-field
                type="number"
                label="Quantidade de recipientes"
                v-model="newModelo.produto.recipientes"
              ></v-text-field>
            </div>
          </div>
        </v-card-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" variant="elevated" text="Adicionar Produto" @click="adicionarProduto"></v-btn>
          <v-btn
            v-if="newModelo.produto.length > 1"
            color="danger mr-4"
            variant="tonal"
            text="Remover Produto"
            @click="removerProduto"
          ></v-btn>
          <v-btn color="danger" text="Fechar" variant="tonal" @click="isActive.value = false"></v-btn>
          <v-btn color="success" text="Salvar" variant="tonal" @click="editarModelo"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import axios from "axios";
import ip from "../../../ip";
import MiniStatisticsCard from "../MiniStatisticsCard.vue";

export default {
  name: "EditarModelo",

  components: {
    MiniStatisticsCard,
  },

  data() {
    return {
      modelosCadastrados: [],
      newModelo: {
        modeloSelecionado: null,
        modelo: "",
        processo: "",
        marca: "",
        produto: [
          {
            produto: "",
            consumoPrevio: "",
            precoKg: "",
            base: "",
            recipientes: "",
          },
        ],
      },
    };
  },

  mounted() {
    this.getModelosCadastrados();
    console.log(this.modelosCadastrados);
  },

  methods: {
    getModelosCadastrados() {
      axios
        .get(`http://${ip}:3045/buscaModelosCadastrados`, { processo: "Montagem" })
        .then((response) => {
          response.data.forEach((data) => {
            this.modelosCadastrados.push({
              id: data.id,
              modelo: data.modelo,
            });
          });
        })
        .catch((error) => {
          console.error("Erro no servidor:", error);
        });
    },

    editarModelo() {
      axios
        .put(`http://${ip}:3045/atualizar-modelo`, this.newModelo)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Erro no servidor: ", error);
        });
    },

    adicionarProduto() {
      this.newModelo.produto.push({
        produto: "",
        consumoPrevio: "",
        precoKg: 0,
        base: "",
        recipientes: 0,
      });
    },

    removerProduto() {
      this.newModelo.produto.pop();
    },
  },
};
</script>

<style></style>
