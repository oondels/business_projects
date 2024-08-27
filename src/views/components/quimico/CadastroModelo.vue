<template>
  <v-dialog max-width="900">
    <template v-slot:activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
        <mini-statistics-card
          :title="{ text: 'Cadastro de modelo' }"
          :icon="{
            name: 'library_add',
            color: 'text-white',
            background: 'dark',
          }"
        />
      </div>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card class="z-4">
        <v-card-title class="text-center border-bottom">
          <h3>Cadastrar modelo</h3>
        </v-card-title>
        <v-card-item>
          <h5>Cadastrar</h5>
          <div class="col-12 row mb-2">
            <div class="col-4">
              <v-text-field type="text" label="Nome do modelo" v-model="modelo.modelo"></v-text-field>
            </div>
            <div class="col-4">
              <v-select :items="processoCadastroModelo" label="Processo" v-model="modelo.processo"></v-select>
            </div>
            <div class="col-4">
              <v-select :items="['Fila', 'Nike']" label="Marca" v-model="modelo.marca"></v-select>
            </div>
          </div>

          <div v-for="(produto, index) in produtos" :key="index" class="col-12 row mb-2">
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
              <v-select :items="baseCadastroModelo" label="Base do produto" v-model="produto.base"></v-select>
            </div>
            <div class="col-4">
              <v-text-field type="number" label="Quantidade de recipientes" v-model="produto.recipientes"></v-text-field>
            </div>
          </div>

          <div class="col-12 text-end"></div>
        </v-card-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" variant="elevated" text="Adicionar produto" @click="adicionarProduto"></v-btn>
          <v-btn color="danger" variant="tonal" text="Fechar" @click="isActive.value = false"></v-btn>
          <v-btn color="success" variant="tonal" text="Salvar" @click="cadastrarModelo"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import MiniStatisticsCard from "../MiniStatisticsCard.vue";
import ip from "../../../ip";
import VueJwtDecode from "vue-jwt-decode";
import Alert from "../Alert.vue";

export default {
  name: "CadastroModelo",
  data() {
    return {
      modelo: {
        modelo: "",
        processo: "",
        marca: "",
      },
      produtos: [
        {
          produto: "",
          consumoPrevio: "",
          precoKg: 0,
          base: "",
          recipientes: 0,
        },
      ],
      processoCadastroModelo: ["Montagem", "Pré fabricado", "Serigrafia"],
      baseCadastroModelo: ["Água", "Solvente"],
      filtroCadastroModelo: {
        modelo: "",
        processo: "",
        base: "",
      },
    };
  },
  methods: {
    adicionarProduto() {
      this.produtos.push({
        produto: "",
        consumoPrevio: "",
        precoKg: 0,
        base: "",
        recipientes: 0,
      });
    },

    cadastrarModelo() {
      axios
        .post(`http://${ip}:3045/cadastrarModelo`, {
          modelo: this.modelo,
          produtos: this.produtos,
          usuario: this.decodeJwt().usuario,
        })
        .then((response) => {
          this.$refs.alert.mostrarAlerta("success", "fas fa-thumbs-up", "Sucesso", response.data);
          this.zerarCadastroModelo();
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta("warning", "fas fa-exclamation", "Atenção", error.response.data);
        });
    },
    zerarCadastroModelo() {
      this.modelo = {
        modelo: "",
        processo: "",
        marca: "",
      };
      this.produtos = [
        {
          produto: "",
          consumoPrevio: "",
          precoKg: 0,
          base: "",
          recipientes: 0,
        },
      ];
    },
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },
  },
  components: {
    MiniStatisticsCard,
    Alert,
  },
};
</script>
