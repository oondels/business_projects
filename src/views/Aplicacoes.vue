<template>
  <div class="title-aplicacoes">
    <h6 class="mb-4">Aplicações</h6>
  </div>

  <div class="mb-4 row col-12">
    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <a
        class="ambulatorio"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
        href="http://10.100.1.43/ambulatorios/"
      >
        <span class="aplication-title-card">
          Ambulatório
          <img :src="ambulatorioImg" />
        </span>
      </a>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        class="ferramentas-lean"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
        to="/ferramentas-lean"
      >
        <span class="aplication-title-card">
          Ferramentas Lean
          <img :src="ferramentasleanImg" />
        </span>
      </router-link>
    </div>

    <div
      class="col-4 mb-4 aplication-card"
      v-if="construcao() && permissionSestApps"
    >
      <router-link
        class="baixaProduto"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
        to="/baixa-produto"
        target="_blank"
      >
        <span class="aplication-title-card">
          Baixa Produto
          <img :src="baixaProdutoImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <a
        class="gerenciamento"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
        href="http://192.168.26.90/producao/consulta"
        target="_blank"
      >
        <span class="aplication-title-card">
          Gerenciamento
          <img :src="gerenciamentoImg" />
        </span>
      </a>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        to="/pcp"
        class="pcp"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          PCP
          <img :src="pcpImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <a
        href="http://10.100.1.43/pe_confirmado/"
        class="pe_confirmado"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Pé Confirmado
          <img :src="peConfirmado" />
        </span>
      </a>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        to="/manutencao"
        class="manutencao"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Manual de Máquinas
          <img :src="manutencaoImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <a
        href="http://10.100.1.43/pense&aja-sest/"
        class="penseAja"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Pense & Aja
          <img :src="currentPenseAjaImage" />
        </span>
      </a>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <a
        href="http://192.168.26.90/producao"
        target="_blank"
        class="previsao"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Previsão
          <img :src="previsaoImg" />
        </span>
      </a>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        to="/quimico"
        class="quimico"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Químico
          <img :src="quimicoImg" />
        </span>
      </router-link>
    </div>

    <div
      class="col-4 mb-4 aplication-card"
      v-if="permissaoDP() && permissionSestApps"
    >
      <router-link
        to="/departamento-pessoal"
        class="departamento-pessoal"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Departamento Pessoal
          <img :src="provisorioImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        to="/refeitorio"
        class="refeitorio"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Refeitório
          <img :src="refeitorioImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <a
        href="http://10.100.1.43/season"
        target="_blank"
        class="season"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Season
          <img :src="seasonImg" />
        </span>
      </a>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        to="/sorteio"
        class="sorteio"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Sorteios
          <img :src="sorteioImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        to="/tempos&metodos"
        class="tempos-metodos"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Tempos & Métodos
          <img :src="temposMetodosImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permissionSestApps" class="col-4 mb-4 aplication-card">
      <router-link
        to="/treinamentos"
        class="treinamentos"
        @mouseover.self="addHover"
        @mouseleave.self="removeHover"
      >
        <span class="aplication-title-card">
          Treinamentos
          <img :src="treinamentosImg" />
        </span>
      </router-link>
    </div>
  </div>

  <hr />

  <div class="dashboards">
    <div class="title-aplicacoes">
      <h6 class="mb-4">Dashboards</h6>
    </div>
    <div class="d-flex col-12">
      <lista-generica :items="items" />
    </div>
  </div>
</template>

<script>
import ambulatorioImg from "../../public/img/aplicacoes/ambulatorio.png";
import baixaProdutoImg from "../../public/img/aplicacoes/baixaproduto.png";
import ferramentasleanImg from "../../public/img/aplicacoes/ferramentaslean.png";
import gerenciamentoImg from "../../public/img/aplicacoes/gerenciamento.png";
import manutencaoImg from "../../public/img/aplicacoes/manutencao.png";
import pcpImg from "../../public/img/aplicacoes/pcp.png";
import peConfirmado from "../../public/img/aplicacoes/pe_confirmado.png";
import penseajaImg from "../../public/img/aplicacoes/penseaja.png";
import penseajaImgActive from "../../public/img/aplicacoes/penseAjaActive.png";
import previsaoImg from "../../public/img/aplicacoes/previsao.png";
import provisorioImg from "../../public/img/aplicacoes/provisorio.png";
import quimicoImg from "../../public/img/aplicacoes/quimico.png";
import refeitorioImg from "../../public/img/aplicacoes/refeitorio.png";
import seasonImg from "../../public/img/aplicacoes/season.png";
import sorteioImg from "../../public/img/aplicacoes/sorteio.png";
import temposMetodosImg from "../../public/img/aplicacoes/temposemetodos.png";
import treinamentosImg from "../../public/img/aplicacoes/treinamentos.png";

import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../ip";
import ListaGenerica from "./components/ListaGenerica.vue";

export default {
  name: "tables",
  components: {
    ListaGenerica,
  },

  mounted() {
    this.permissaoDP();
    this.permissaoPcp();
    this.sestPermission();
  },

  methods: {
    addHover(e) {
      const className = e.target.classList[0];
      const appElement = document.querySelector(`.${className}`);
      appElement.classList.add("hover");

      if (className === "penseAja") {
        this.currentPenseAjaImage = penseajaImgActive;
      }
    },

    removeHover(e) {
      const className = e.target.classList[0];
      const appElement = document.querySelector(`.${className}`);
      appElement.classList.remove("hover");

      if (className === "penseAja") {
        this.currentPenseAjaImage = penseajaImg;
      }
    },

    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    sestPermission() {
      axios
        .get(`http://${ip}:3041/sest-permission`)
        .then((response) => {
          this.permissionSestApps = response.data;

          console.log(this.permissionSestApps);
        })
        .catch((error) => {
          console.error("Erro consultar geolocation: ", error);
        });
    },

    unidadeSest() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (this.decodeJwt().unidade === "SEST") {
        return true;
      }
    },

    permissaoDP() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (
        this.decodeJwt().setor === "AUTOMACAO" ||
        this.decodeJwt().setor === "DEPARTAMENTO PESSOAL"
      ) {
        return true;
      }
    },

    permissaoPcp() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (
        this.decodeJwt().setor === "AUTOMACAO" ||
        this.decodeJwt().setor === "PPCP"
      ) {
        return true;
      }
    },

    permissaoTemposMetodos() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (
        this.decodeJwt().setor === "AUTOMACAO" ||
        this.decodeJwt().setor === "TEMPOS E METODOS"
      ) {
        return true;
      }
    },

    permissaoRH() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (
        this.decodeJwt().setor === "AUTOMACAO" ||
        this.decodeJwt().setor === "RECURSOS HUMANOS"
      ) {
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
      onHover: false,
      currentPenseAjaImage: penseajaImg,

      permissionSestApps: false,

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
      peConfirmado: peConfirmado,
      temposMetodosImg: temposMetodosImg,
      treinamentosImg: treinamentosImg,
      quimicoImg: quimicoImg,
      sorteioImg: sorteioImg,
      manutencaoImg: manutencaoImg,

      items: [
        {
          title: "EXPEDIÇÃO",
          acessos: [
            {
              nome: "Expedição",
              link: "https://lookerstudio.google.com/reporting/adff8154-d908-4d0f-9d1c-a299569a83c7",
            },
            {
              nome: "Produtividade",
              link: "https://lookerstudio.google.com/reporting/70246e53-f2e4-4994-a351-16ccf4f67b51",
            },
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
            {
              nome: "Expedição Nike",
              link: "https://lookerstudio.google.com/reporting/6b4785eb-5b93-4a77-989d-cf4642defeaf",
            },
          ],
        },

        {
          title: "PERFORMANCE",
          acessos: [
            {
              nome: "Auditoria LEAN - Ferramentais",
              link: "https://lookerstudio.google.com/reporting/b465f22e-9569-4e85-99ab-a5bcc1dca5c6",
            },
            {
              nome: "Indicador T.O.",
              link: "https://lookerstudio.google.com/reporting/caeabf1a-8a2e-4e6b-ae42-9bf2248644d1",
            },
            {
              nome: "Liderança de resultados",
              link: "https://lookerstudio.google.com/reporting/f34bb26f-7df2-4127-aaab-e50a00a40750/page/p_7fxt39f06c",
            },
            {
              nome: "Melhoria Contínua",
              link: "https://lookerstudio.google.com/reporting/4435e7e4-5314-48b2-8c2a-6659ec187429",
            },
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
            {
              nome: "5's",
              link: "https://lookerstudio.google.com/reporting/a87626e4-243a-48bc-acb9-0fcac256a603",
            },
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
          acessos: [
            {
              nome: "Resíduo",
              link: "https://lookerstudio.google.com/reporting/904f6c5d-9411-4d60-98a5-e6b1dd564466",
            },
          ],
        },

        {
          title: "QUALIDADE",
          acessos: [
            {
              nome: "Análise Checklist",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/AnlisedeChecklist_17164841004280/Checklist?:iid=1",
            },
            {
              nome: "Análise DI",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/AnliseDI02/DI?:iid=1",
            },
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
            {
              nome: "Relatório parada de setor",
              link: "https://lookerstudio.google.com/s/su_j9U6BKFE",
            },
            {
              nome: "KPIs Qualidade | Devolução",
              link: "https://lookerstudio.google.com/reporting/7e8d7fe2-48f9-4a0c-9f43-95ee8463f7a3",
            },
            {
              nome: "Revisão cabedal",
              link: "https://lookerstudio.google.com/reporting/437d4e7b-c7d5-44b8-9ced-49fe6252b4be",
            },
            {
              nome: "Tático",
              link: "https://lookerstudio.google.com/reporting/af7a7e72-07f5-4a80-97a0-27179e5df135",
            },
          ],
        },

        {
          title: "SSMA",
          acessos: [
            {
              nome: "Acidente",
              link: "https://lookerstudio.google.com/reporting/fe53647b-4ca5-468b-ae37-831c797aaea4",
            },
            {
              nome: "Atestado",
              link: "https://lookerstudio.google.com/reporting/ddad932b-5df2-4acc-bfe6-9a53ac7c9f01",
            },
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
            {
              nome: "Saldo Fila",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/SaldoFILA/Corte?:iid=3",
            },
            {
              nome: "Saldo Nike",
              link: "https://bi.grupodass.com.br/#/site/Operacoes/views/SaldoNIKE/Corte?:iid=2",
            },
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
            {
              nome: "Giros",
              link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-PCP",
            },
            {
              nome: "Manutenção",
              link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-MAN",
            },
            {
              nome: "Produção Und.",
              link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-IND-AP",
            },
            {
              nome: "Supermercado",
              link: "https://tvdash.grupodass.com.br/dashboard/tv/SEST-ABM-FAB2E3",
            },
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
  align-items: center;
  text-align: center;
}

.aplication-card a {
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  background-color: #fff;
  border-radius: 20px;
  width: 235px;
  height: 95px;
  padding: 10px;
  transition:
    background-color 0.8s ease,
    color 0.8s ease;
}

.aplication-card a span {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.aplication-card a:hover {
  box-shadow: rgba(100, 100, 111, 0.1) 0px 7px 29px 0px;
  background-color: rgba(255, 255, 255, 0.8);
  color: red;
}

.aplication-card img {
  margin-left: 5px;
  max-width: 80px;
  transition: transform 0.5s ease;
}

.aplication-card .hover img {
  transform: scale(1.05);
}

.dark {
  background-color: rgb(47, 47, 47) !important;
}

@media screen and (max-width: 880px) {
  .aplication-card a {
    font-size: 14px;
    max-width: 190px;
    height: 80px;
    padding: 5px;
  }

  .aplication-card img {
    width: 60px;
  }
}

@media screen and (max-width: 600px) {
  .aplication-card a {
    font-size: 12px;
    max-width: 120px;
    height: 90px;
  }

  .aplication-card img {
    width: 50px;
  }

  .aplication-card a span {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
}
</style>
