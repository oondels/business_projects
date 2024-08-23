<template>
  <div class="title-aplicacoes">
    <h6 class="mb-10">Aplicações</h6>
  </div>

  <div class="mb-4 row col-12">
    <div class="col-4 mb-4 aplication-card">
      <div class="aplication-title-card">Ambulatório</div>
      <a href="http://192.168.26.90/ambulatorios" target="_blank">
        <img :src="ambulatorioImg" />
      </a>
    </div>

    <div class="col-4 mb-4" v-if="construcao()">
      <router-link to="/baixa-produto">
        <v-card class="mx-auto" height="90" :image="baixaProdutoImg" max-width="200" theme="light" title="Baixa produto"></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4">
      <router-link to="/ferramentas-lean">
        <v-card
          class="mx-auto"
          height="90"
          :image="ferramentasleanImg"
          max-width="200"
          theme="light"
          title="Ferramentas Lean"
        ></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4">
      <a href="http://192.168.26.90/producao/consulta" target="_blank">
        <v-card class="mx-auto" height="90" :image="gerenciamentoImg" max-width="200" theme="light" title="Gerenciamento">
        </v-card>
      </a>
    </div>

    <div class="col-4 mb-4" v-if="permissaoPcp()">
      <router-link to="/pcp">
        <v-card class="mx-auto" :image="pcpImg" height="90" max-width="200" theme="light" title="PCP"></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4">
      <router-link to="/manutencao">
        <v-card
          class="mx-auto"
          height="90"
          :image="manutencaoImg"
          max-width="200"
          theme="light"
          title="Manual de Máquinas"
        ></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4">
      <a href="http://192.168.26.90/pense&aja/" target="_blank">
        <v-card class="mx-auto" height="90" :image="penseajaImg" max-width="200" theme="light" title="Pense & Aja"></v-card>
      </a>
    </div>

    <div class="col-4 mb-4">
      <a href="http://192.168.26.90/producao" target="_blank">
        <v-card class="mx-auto" height="90" :image="previsaoImg" max-width="200" theme="light" title="Previsão"></v-card>
      </a>
    </div>

    <div class="col-4 mb-4" v-if="permissaoDP()">
      <router-link to="/departamento-pessoal">
        <v-card
          class="mx-auto"
          :image="provisorioImg"
          height="90"
          max-width="200"
          theme="light"
          title="Departamento Pessoal"
        ></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4">
      <router-link to="/quimico">
        <v-card class="mx-auto" :image="quimicoImg" height="90" max-width="200" theme="light" title="Químico"></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4">
      <router-link to="/refeitorio">
        <v-card class="mx-auto" :image="refeitorioImg" height="90" max-width="200" theme="light" title="Refeitório"></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4">
      <a href="http://10.100.1.43:3000" target="_blank"
        ><v-card class="mx-auto" height="90" :image="seasonImg" max-width="200" theme="light" title="Season"></v-card>
      </a>
    </div>

    <div class="col-4 mb-4" v-if="permissaoRH()">
      <router-link to="/sorteio">
        <v-card class="mx-auto" :image="sorteioImg" height="90" max-width="200" theme="light" title="Sorteio"></v-card>
      </router-link>
    </div>

    <div class="col-4 mb-4" v-if="permissaoTemposMetodos()">
      <router-link to="/tempos&metodos">
        <v-card class="mx-auto" :image="temposMetodosImg" height="90" max-width="200" theme="light" title="T & M"></v-card>
      </router-link>
    </div>
  </div>

  <hr />

  <div class="title-aplicacoes">
    <h6 class="mb-10">Dashboards</h6>
  </div>
  <div class="d-flex col-12">
    <lista-generica :items="items" />
  </div>
</template>

<script>
import ambulatorioImg from "../../public/img/aplicacoes/ambulatorio.png";
import baixaProdutoImg from "../../public/img/aplicacoes/baixaproduto.png";
import ferramentasleanImg from "../../public/img/aplicacoes/ferramentaslean.png";
import gerenciamentoImg from "../../public/img/aplicacoes/gerenciamento.png";
import manutencaoImg from "../../public/img/aplicacoes/manutencao.png";
import pcpImg from "../../public/img/aplicacoes/pcp.png";
import penseajaImg from "../../public/img/aplicacoes/penseaja.png";
import previsaoImg from "../../public/img/aplicacoes/previsao.png";
import provisorioImg from "../../public/img/aplicacoes/provisorio.png";
import quimicoImg from "../../public/img/aplicacoes/quimico.png";
import refeitorioImg from "../../public/img/aplicacoes/refeitorio.png";
import seasonImg from "../../public/img/aplicacoes/season.png";
import sorteioImg from "../../public/img/aplicacoes/sorteio.png";
import temposMetodosImg from "../../public/img/aplicacoes/temposemetodos.png";

import VueJwtDecode from "vue-jwt-decode";
import ListaGenerica from "./components/ListaGenerica.vue";

export default {
  name: "tables",
  components: {
    ListaGenerica,
  },

  mounted() {
    this.permissaoDP();
    this.permissaoPcp();
  },

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    permissaoDP() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (this.decodeJwt().setor === "AUTOMACAO" || this.decodeJwt().setor === "DEPARTAMENTO PESSOAL") {
        return true;
      }
    },

    permissaoPcp() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (this.decodeJwt().setor === "AUTOMACAO" || this.decodeJwt().setor === "PPCP") {
        return true;
      }
    },

    permissaoTemposMetodos() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (this.decodeJwt().setor === "AUTOMACAO" || this.decodeJwt().setor === "TEMPOS E METODOS") {
        return true;
      }
    },

    permissaoRH() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (this.decodeJwt().setor === "AUTOMACAO" || this.decodeJwt().setor === "RECURSOS HUMANOS") {
        return true;
      }
    },

    construcao() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (this.decodeJwt().setor === "AUTOMACAO") {
        return true;
      }
    },
  },

  data() {
    return {
      ambulatorioImg: ambulatorioImg,
      baixaProdutoImg: baixaProdutoImg,
      gerenciamentoImg: gerenciamentoImg,
      penseajaImg: penseajaImg,
      previsaoImg: previsaoImg,
      seasonImg: seasonImg,
      ferramentasleanImg: ferramentasleanImg,
      refeitorioImg: refeitorioImg,
      provisorioImg: provisorioImg,
      pcpImg: pcpImg,
      temposMetodosImg: temposMetodosImg,
      quimicoImg: quimicoImg,
      sorteioImg: sorteioImg,
      manutencaoImg: manutencaoImg,

      items: [
        {
          title: "EXPEDIÇÃO",
          acessos: [
            { nome: "Expedição", link: "https://lookerstudio.google.com/reporting/adff8154-d908-4d0f-9d1c-a299569a83c7" },
            { nome: "Produtividade", link: "https://lookerstudio.google.com/reporting/70246e53-f2e4-4994-a351-16ccf4f67b51" },
          ],
        },

        {
          title: "MANUTENÇÃO",
          acessos: [
            {
              nome: "Ranking auditoria TPM",
              link: "https://lookerstudio.google.com/u/0/reporting/3d8859fe-53d5-4cd4-98dc-4d29377e3139/page/4gejD",
            },
          ],
        },

        {
          title: "ORGANOGRAMA",
          acessos: [
            { nome: "Expedição Nike", link: "https://lookerstudio.google.com/reporting/6b4785eb-5b93-4a77-989d-cf4642defeaf" },
          ],
        },

        {
          title: "PERFORMANCE",
          acessos: [
            {
              nome: "Auditoria LEAN - Ferramentais",
              link: "https://lookerstudio.google.com/reporting/b465f22e-9569-4e85-99ab-a5bcc1dca5c6",
            },
            { nome: "Indicador T.O.", link: "https://lookerstudio.google.com/reporting/caeabf1a-8a2e-4e6b-ae42-9bf2248644d1" },
            {
              nome: "Liderança de resultados",
              link: "https://lookerstudio.google.com/reporting/f34bb26f-7df2-4127-aaab-e50a00a40750/page/p_7fxt39f06c",
            },
            { nome: "Melhoria Contínua", link: "https://lookerstudio.google.com/reporting/4435e7e4-5314-48b2-8c2a-6659ec187429" },
          ],
        },

        {
          title: "PPCP",
          acessos: [
            {
              nome: "Indicadores PPCP",
              link: "https://lookerstudio.google.com/u/0/reporting/974b81eb-1174-48f7-a5e8-8cfc5173ab5e/page/p_dif0e9czed",
            },
          ],
        },

        {
          title: "PRODUÇÃO",
          acessos: [
            { nome: "5's", link: "https://lookerstudio.google.com/reporting/a87626e4-243a-48bc-acb9-0fcac256a603" },
            {
              nome: "Eficiência - Estratégica",
              link: "https://lookerstudio.google.com/reporting/6d7bb8d9-56c1-4eb9-a35f-7e0c3e506fde",
            },
            {
              nome: "Eficiência - Tática",
              link: "https://lookerstudio.google.com/reporting/a58e74de-ec69-460e-94a8-1c910465b946",
            },
            {
              nome: "Produção hora a hora",
              link: "https://lookerstudio.google.com/reporting/455bddc0-7914-42b2-b8c0-287aa179571a/page/p_pv3d1xa3dd",
            },
          ],
        },

        {
          title: "QUÍMICO",
          acessos: [{ nome: "Resíduo", link: "https://lookerstudio.google.com/reporting/904f6c5d-9411-4d60-98a5-e6b1dd564466" }],
        },

        {
          title: "QUALIDADE",
          acessos: [
            {
              nome: "Análise Checklist",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/AnlisedeChecklist_17164841004280/Checklist?:iid=1",
            },
            { nome: "Análise DI", link: "https://bi.grupodass.com.br/#/site/Operacoes/views/AnliseDI02/DI?:iid=1" },
            {
              nome: "Análise Retrabalho",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/AnliseRetrabalho_17164841998980/RetrabalhosRFT?:iid=2",
            },
            {
              nome: "Análise B-Grade e Perdas",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/AnliseBGradePerdasCalados2_0/AnliseQtdPerdasB-grade?:iid=2",
            },
            {
              nome: "Inbound Inspection Calçados",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/InboundInspection/InboundCalados?:iid=1",
            },
            { nome: "Relatório parada de setor", link: "https://lookerstudio.google.com/s/su_j9U6BKFE" },
            {
              nome: "KPIs Qualidade | Devolução",
              link: "https://lookerstudio.google.com/reporting/7e8d7fe2-48f9-4a0c-9f43-95ee8463f7a3",
            },
            { nome: "Revisão cabedal", link: "https://lookerstudio.google.com/reporting/437d4e7b-c7d5-44b8-9ced-49fe6252b4be" },
            { nome: "Tático", link: "https://lookerstudio.google.com/reporting/af7a7e72-07f5-4a80-97a0-27179e5df135" },
          ],
        },

        {
          title: "SSMA",
          acessos: [
            { nome: "Acidente", link: "https://lookerstudio.google.com/reporting/fe53647b-4ca5-468b-ae37-831c797aaea4" },
            { nome: "Atestado", link: "https://lookerstudio.google.com/reporting/ddad932b-5df2-4acc-bfe6-9a53ac7c9f01" },
            {
              nome: "Caixas Vermelhas",
              link: "https://lookerstudio.google.com/reporting/64c63708-b5eb-4752-94fc-22f9587b6502/page/by2CD",
            },
            {
              nome: "Restrições médicas",
              link: "https://lookerstudio.google.com/reporting/48535d51-9408-4426-a8d9-50400f28e15e",
            },
          ],
        },

        {
          title: "TABLEAU",
          acessos: [
            { nome: "Saldo Fila", link: "https://bi.grupodass.com.br/#/site/Operacoes/views/SaldoFILA/Corte?:iid=3" },
            { nome: "Saldo Nike", link: "https://bi.grupodass.com.br/#/site/Operacoes/views/SaldoNIKE/Corte?:iid=2" },
            {
              nome: "Semanas em aberto",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/SemanaemAberto/SemanaemAberto_1?:iid=1",
            },
          ],
        },

        {
          title: "TRF",
          acessos: [
            {
              nome: "Curva do ramp up",
              link: "https://lookerstudio.google.com/reporting/16949610-37cb-4e6f-b717-772d83bed7ee/page/oJIhD/edit",
            },
          ],
        },

        {
          title: "TV DASH",
          acessos: [
            { nome: "Giros", link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-PCP" },
            { nome: "Manutenção", link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-MAN" },
            { nome: "Produção Und.", link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-IND-AP" },
            { nome: "Supermercado", link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-ABM-FAB2E3" },
          ],
        },
      ],
    };
  },
};
</script>

<style>
.title-aplicacoes h6 {
  font-size: 30px;
  text-align: center;
  border-bottom: 1px solid red;
}

.title-aplicacoes {
  width: 100%;
  display: flex;
  justify-content: center;
}

.aplication-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background-color: #fff;
  border-radius: 20px;
  max-width: 220px;
}

.aplication-card:hover {
  color: red;
}

.aplication-card img {
  max-width: 100px;
}
</style>
