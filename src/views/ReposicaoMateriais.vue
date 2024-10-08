<template>
  <div class="reposicao-container">
    <solicitacao-material />
  </div>

  <div class="solicitacoes-container">
    <solicitacoes-reposicao />
  </div>

  <div class="solicitacoes-container">
    <solicitacao-consumo />
  </div>
</template>

<script>
import SolicitacaoConsumo from "./components/reposicaoMateriais/SolicitacaoConsumo.vue";
import SolicitacaoMaterial from "./components/reposicaoMateriais/SolicitacaoMaterial.vue";
import SolicitacoesReposicao from "./components/reposicaoMateriais/SolicitacoesReposicao.vue";

export default {
  name: "ReposicaoMateriais",
  components: {
    SolicitacaoMaterial,
    SolicitacoesReposicao,
    SolicitacaoConsumo,
  },

  data() {
    return {};
  },
};
</script>
