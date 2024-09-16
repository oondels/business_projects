<template>
  <div class="container text-black">
    <h6>Liberação</h6>

    <div class="card mb-4 p-3">
      <div class="row col-12">
        <fieldset class="p-3 rounded col-6">
          <p>Colaborador</p>
          <v-text-field
            type="number"
            ref="codifoField"
            :rules="codigoRfidRules"
            label="Leia o código"
            v-model="codigoRfid"
            @keypress.enter="buscaColaboradorRfid(codigoRfid)"
          ></v-text-field>
          <v-text-field
            :disabled="colaboradorExistente"
            type="number"
            :rules="matriculaRules"
            label="Digite a matrícula"
            v-model="matriculaColaborador"
            @keypress.enter="buscaColaboradorMatricula(matriculaColaborador)"
          ></v-text-field>
          <v-text-field
            type="text"
            v-model="nomeColaborador"
            placeholder="Nome"
            disabled
          ></v-text-field>
        </fieldset>

        <fieldset class="p-3 rounded col-6">
          <p>Material</p>
          <v-text-field
            type="text"
            ref="pedidoField"
            :rules="pedidoRules"
            v-model="pedido"
            placeholder="Pedido"
            @keypress.enter="buscaPedido(pedido)"
          ></v-text-field>
          <v-text-field
            type="text"
            v-model="produto"
            placeholder="Produto"
            disabled
          ></v-text-field>
          <v-text-field
            type="text"
            v-model="descricao"
            placeholder="Descricao"
            disabled
          ></v-text-field>
        </fieldset>
      </div>
      <v-btn class="bg-danger text-white" @click="salvaEntrega"
        >Salvar Entrega</v-btn
      >
    </div>

    <h6>Pedidos entregues</h6>

    <div class="card mb-4 px-2 py-3" v-if="entregas">
      <v-text-field
        type="date"
        class="col-2"
        v-model="dataFiltro"
        @change="buscaEntregas(dataFiltro)"
      ></v-text-field>
      <ul class="list-group">
        <li
          class="list-group-item col-12 d-flex justify-content-between"
          v-for="entrega in entregas"
          :key="entrega.id"
        >
          <span
            class="col-2 text-center d-flex justify-content-center align-items-center"
            >{{
              entrega.nome.split(" ")[0] + " " + entrega.nome.split(" ").pop()
            }}</span
          >
          <span
            class="col-2 text-center d-flex justify-content-center align-items-center"
            >{{ entrega.matricula }}</span
          >
          <span
            class="col-4 text-center d-flex justify-content-center align-items-center"
            >{{ entrega.descricao }}</span
          >
          <span
            class="col-2 text-center d-flex justify-content-center align-items-center"
            >{{ entrega.pedido }}</span
          >
          <span
            class="col-2 text-center d-flex justify-content-center align-items-center"
            >{{ entrega.produto }}</span
          >
        </li>
      </ul>
    </div>

    <h6>Importação de pedidos</h6>

    <div class="card mb-4 p-3">
      <v-file-input
        class="mb-4"
        label="Importe a planilha"
        @change="handleFileUpload"
      ></v-file-input>
      <v-btn class="bg-danger text-white" @click="importarPlanilhaPedidos"
        >Subir Planilha</v-btn
      >
    </div>
  </div>

  <v-overlay v-model="loading" class="align-center justify-center">
    <v-progress-circular
      :size="80"
      :width="8"
      color="danger"
      indeterminate
    ></v-progress-circular>
  </v-overlay>
</template>

<style>
.list-group-item {
  font-size: 0.7rem;
}
</style>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../ip";

export default {
  name: "pcp",

  data() {
    return {
      planilhaPedidos: null,
      loading: false,

      codigoRfid: null,
      nomeColaborador: null,
      matriculaColaborador: null,
      pedido: null,
      produto: null,
      descricao: null,

      ip: null,

      entregas: [],
      dataFiltro: "",

      pedidoRules: [
        this.pedidoExistente || "Digitação incorreta ou inexistente no sistema",
      ],
      matriculaRules: [
        (value) =>
          (value && value.length === 7) || "Insira seu crachá completo",
      ],
      codigoRfidRules: [
        this.colaboradorExistente ||
          "Parece que a sua matricula não consta em nossos registros",
      ],

      colaboradorExistente: true,
      pedidoExistente: true,
    };
  },

  mounted() {
    this.buscaEntregas(this.getDataAtual());
    this.focoNoInput("codifoField");
    this.ip = ip;
  },

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    focoNoInput(refInput) {
      this.$nextTick(() => {
        this.$refs[refInput].focus();
      });
    },

    getDataAtual() {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");

      this.dataFiltro = `${ano}-${mes}-${dia}`;

      return `${ano}-${mes}-${dia}`;
    },

    buscaColaboradorRfid(codigoRfid) {
      axios
        .get(`http://${ip}:3047/buscaColaboradorRfid`, {
          params: { codigoRfid: codigoRfid },
        })
        .then((response) => {
          if (!response.data) {
            this.colaboradorExistente = false;
          }
          this.nomeColaborador = response.data.nome;
          this.matriculaColaborador = response.data.matricula;
          this.focoNoInput("pedidoField");
        })
        .catch(() => {
          alert("Não encontrado");
        });
    },

    buscaColaboradorMatricula(matricula) {
      axios
        .get(`http://${ip}:3047/buscaColaboradorMatricula`, {
          params: { matricula: matricula },
        })
        .then((response) => {
          this.nomeColaborador = response.data.nome;
        })
        .catch(() => {
          alert("Não encontrado");
        });
    },

    buscaPedido(pedido) {
      axios
        .get(`http://${ip}:3047/buscaPedido`, { params: { pedido: pedido } })
        .then((response) => {
          if (!response.data) {
            this.pedidoExistente = false;
          }
          this.produto = response.data.produto;
          this.descricao = response.data.descricao;
        });
    },

    buscaEntregas(data) {
      axios
        .get(`http://${ip}:3047/buscaEntregas`, { params: { data: data } })
        .then((response) => {
          this.entregas = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },

    salvaEntrega() {
      axios
        .post(`http://${ip}:3047/salvaEntrega`, {
          rfid: this.codigoRfid,
          nome: this.nomeColaborador,
          matricula: this.matriculaColaborador,
          pedido: this.pedido,
          produto: this.produto,
          descricao: this.descricao,
          usuario: this.decodeJwt().usuario,
        })
        .then(() => {
          this.buscaEntregas(this.getDataAtual());
        })
        .catch((error) => {
          console.error(
            "Erro ao salvar entrega:",
            error.response ? error.response.data : error.message
          );
        });
    },

    handleFileUpload(event) {
      this.planilhaPedidos = event.target.files[0];
    },

    importarPlanilhaPedidos() {
      this.loading = true;
      if (!this.planilhaPedidos) {
        alert("Por favor, selecione um arquivo.");
        return;
      }

      const formData = new FormData();
      formData.append("planilha", this.planilhaPedidos);

      axios
        .post(`http://${ip}:3047/importarPlanilhaPedidos`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          this.loading = false;
          this.planilhaPedidos = null;
        })
        .catch((error) => {
          this.loading = false;
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.treinamentos-section img {
  width: 100px;
}
</style>
