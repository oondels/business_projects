<template>
  <div class="requisicoes-main-container">
    <div class="tabs d-flex flex-row justify-content-around align-items-center">
      <button
        :class="{ active: tabs.solicitacaoMaterial }"
        @click="changeTab('solicitacaoMaterial')"
      >
        Solicitação Material
        <span class="material-icons">add_circle_outline</span>
      </button>
      <button
        :class="{ active: tabs.solicitacaoConsumo }"
        @click="changeTab('solicitacaoConsumo')"
      >
        Solicitações
        <span class="material-icons">format_list_bulleted</span>
      </button>
      <button
        :class="{ active: tabs.solicitacaoEstoque }"
        @click="changeTab('solicitacaoEstoque')"
        v-if="authVerification()"
      >
        Solicitações Aprovadas
        <span class="material-icons">inventory</span>
      </button>
    </div>

    <div class="reposicao-tabs-info">
      <div class="tabs-content">
        <div v-show="tabs.solicitacaoMaterial" class="reposicao-container">
          <solicitacao-material />
        </div>

        <div v-show="tabs.solicitacaoConsumo" class="solicitacoes-container">
          <solicitacoes-reposicao />
        </div>

        <div v-show="tabs.solicitacaoEstoque" class="solicitacoes-container">
          <solicitacao-consumo />
        </div>
      </div>
    </div>
  </div>
  <alert ref="alert" />
</template>

<script>
import VueJwtDecode from "vue-jwt-decode";
import Alert from "./components/Alert.vue";
import SolicitacaoConsumo from "./components/reposicaoMateriais/SolicitacaoConsumo.vue";
import SolicitacaoMaterial from "./components/reposicaoMateriais/SolicitacaoMaterial.vue";
import SolicitacoesReposicao from "./components/reposicaoMateriais/SolicitacoesReposicao.vue";

export default {
  name: "ReposicaoMateriais",
  components: {
    SolicitacaoMaterial,
    SolicitacoesReposicao,
    SolicitacaoConsumo,
    Alert,
  },

  data() {
    return {
      tabs: {
        solicitacaoMaterial: true,
        solicitacaoConsumo: false,
        solicitacaoEstoque: false,
      },
    };
  },

  computed: {
    decodedJwt() {
      return VueJwtDecode.decode(sessionStorage.getItem("token"));
    },
  },

  methods: {
    authVerification() {
      const user = this.decodedJwt;
      return (
        user &&
        (user.usuario === "ESTOQUE.ABASTECIMENTO" ||
          user.funcao === "AUTOMACAO" ||
          user.funcao === "CONSUMO")
      );
    },

    changeTab(tab) {
      Object.keys(this.tabs).forEach((key) => (this.tabs[key] = false));
      this.tabs[tab] = true;
    },
  },
};
</script>

<style scoped>
.requisicoes-main-container {
  width: 100% !important;
}

.tabs {
  background-color: #3c8bf3;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
}
button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
  transition:
    color 0.3s ease,
    transform 0.3s ease;
  text-transform: uppercase;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

button::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 0;
  height: 3px;
  background-color: white;
  transition: width 0.4s ease-out;
  transform: translateX(50%);
}

button.active::after {
  width: 100%;
  transform: translateX(0%);
}

button.active {
  color: #fff;
}

button:hover {
  color: #ddd;
}
</style>
