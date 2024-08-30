<template>
  <v-dialog max-width="800">
    <template v-slot:activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
        <mini-statistics-card
          :title="{ text: 'Solicitação de pacote' }"
          :icon="{
            name: 'dataset',
            color: 'text-white',
            background: 'primary',
          }"
        />
      </div>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="text-center border-bottom position-sticky fixed-top border-bottom bg-white">
          <h3>Solicitação de químico</h3>
        </v-card-title>
        <v-card-item>
          <div class="col-12 row">
            <div class="col-6">
              <v-select
                :items="processos"
                label="Processo"
                v-model="solicitacao.processo"
                @update:modelValue="buscaModelosCadastrados(solicitacao.processo)"
              ></v-select>
            </div>

            <div class="col-6">
              <v-combobox
                :disabled="!solicitacao.processo"
                :items="dadosModelo"
                filterable
                outlined
                return-object
                item-title="modelo"
                item-value="id"
                label="Modelo"
                v-model="dadosModeloSelecionado"
                @update:modelValue="atribuiModeloSolicitacao(dadosModeloSelecionado)"
              >
              </v-combobox>
            </div>

            <div class="col-6">
              <v-text-field type="number" label="Produção prevista" v-model="solicitacao.producao"></v-text-field>
            </div>

            <div class="col-6">
              <v-text-field type="number" label="Célula" v-model="solicitacao.celula"></v-text-field>
            </div>

            <div class="col-6">
              <v-select :items="['Fábrica 1', 'Fábrica 2', 'Fábrica 3']" label="Fábrica" v-model="solicitacao.fabrica"></v-select>
            </div>

            <div class="col-6">
              <v-select label="Turno" v-model="solicitacao.turno" :items="['TURNO A', 'TURNO B']"></v-select>
            </div>

            <div class="mt-3 col-12">
              <v-text-field
                type="number"
                :rules="matriculaRules"
                label="Matrícula"
                v-model="solicitacao.matricula"
                @keyup="buscaSolicitante(solicitacao.matricula)"
              ></v-text-field>
            </div>

            <div class="col-12">
              <v-text-field type="text" disabled label="Nome" v-model="solicitacao.nome"></v-text-field>
            </div>
          </div>
        </v-card-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="danger"
            text="Fechar"
            variant="tonal"
            @click="
              isActive.value = false;
              zerarSolicitacao;
            "
          ></v-btn>
          <v-btn color="success" text="Salvar" @click="salvarSolicitacao" variant="tonal"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../../../ip";
import Alert from "../Alert.vue";
import MiniStatisticsCard from "../MiniStatisticsCard.vue";

export default {
  name: "solicitacao-pacote",
  emits: ["atualiza-solicitacoes"],
  data() {
    return {
      solicitacao: {
        modelo: "",
        idModelo: 0,
        producao: "",
        celula: null,
        turno: "",
        fabrica: "",
        nome: "",
        matricula: "",
        gerente: "",
        processo: "",
        marca: "",
      },

      matriculaRules: [(value) => (value && value.length >= 7) || "Insira seu crachá completo"],

      processos: [],
      dadosModelo: [],
      dadosModeloSelecionado: null,
    };
  },
  mounted() {
    this.buscaProcessosCadastrados();
  },
  methods: {
    ativaSocket() {
      this.$emit("atualiza-solicitacoes", "pacote");
    },

    atribuiModeloSolicitacao(modeloSelecionado) {
      this.solicitacao.modelo = modeloSelecionado.modelo;
      this.solicitacao.idModelo = modeloSelecionado.id;
      this.solicitacao.marca = modeloSelecionado.marca;
    },

    buscaModelosCadastrados(processo) {
      axios
        .get(`http://${ip}:3045/buscaModelosCadastrados`, { params: { processo: processo } })
        .then((response) => {
          this.dadosModelo = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar modelos cadastrados", error.response);
        });
    },

    buscaProcessosCadastrados() {
      axios
        .get(`http://${ip}:3045/buscaProcessosCadastrados`)
        .then((response) => (this.processos = response.data))
        .catch((error) => console.error("Erro ao buscar modelos cadastrados", error.response));
    },

    buscaSolicitante(matricula) {
      if (matricula.length === 7) {
        axios
          .get(`http://${ip}:3045/cracha`, { params: { matricula: matricula } })
          .then((response) => {
            this.solicitacao.nome = response.data[0].nome;
            this.solicitacao.gerente = response.data[0].gerente;
          })
          .catch((error) => {
            console.error("Erro ao buscar solicitante", error.response);
          });
      }
    },

    salvarSolicitacao() {
      axios
        .post(`http://${ip}:3045/salvarSolicitacaoPacote`, {
          solicitacao: this.solicitacao,
        })
        .then(() => {
          this.zerarSolicitacao();
          this.$refs.alert.mostrarAlerta("success", "fas fa-thumbs-up", "sucesso", "Solicitação salva com sucesso");
          this.$emit("atualiza-solicitacoes", "pacote");
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta("warning", "fas fa-exclamation", "Atenção", error.response.data);
        });
    },

    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    zerarSolicitacao() {
      this.solicitacao = {};
      this.dadosModeloSelecionado = null;
    },
  },

  components: {
    MiniStatisticsCard,
    Alert,
  },
};
</script>
