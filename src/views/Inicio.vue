<template>
  <div class="py-4 container-fluid">
    <div class="row mb-4">
      <div class="col-lg-12 position-relative z-index-2">
        <div class="row">
          <div class="col-lg-4 col-md-6 col-sm-6">
            <mini-statistics-card v-if="producao"
              :title="{ text: 'Produção de ontem', value: `${(producao.media * 100).toFixed(2)}%` }" :icon="{
                name: 'leaderboard',
                color: 'text-white',
                background: 'dark',
              }" />
          </div>

          <div class="col-lg-4 col-md-6 col-sm-6 mt-lg-0">
            <mini-statistics-card v-if="qualidade"
              :title="{ text: 'Qualidade', value: `${(qualidade.media * 100).toFixed(2)}%` }" :icon="{
                name: 'leaderboard',
                color: 'text-white',
                background: 'info',
              }" />
          </div>

          <div class="col-lg-4 col-md-12 col-sm-6 mt-lg-0">
            <mini-statistics-card v-if="eficiencia"
              :title="{ text: 'Eficiência média mensal', value: `${(eficiencia.media * 100).toFixed(2)}%` }" :icon="{
                name: 'leaderboard',
                color: 'text-white',
                background: 'success',
              }" />
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 mb-4">
            <chart-holder-card title="Produção real" subtitle="Montante produzido na fábrica"
              update="Atualizado diariamente" color="dark">
              <reports-line-chart id="tasks-chart" v-if="producao" :chart="{
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                datasets: {
                  label: 'Produção',
                  data: [(producao.seg * 100).toFixed(2), (producao.ter * 100).toFixed(2), (producao.qua * 100).toFixed(2), (producao.qui * 100).toFixed(2), (producao.sex * 100).toFixed(2)],
                },
              }" />
            </chart-holder-card>
          </div>

          <div class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4">
            <chart-holder-card title="Qualidade (DI)" subtitle="Geral de DI da fábrica" update="Atualizado diariamente"
              color="info">
              <reports-line-chart id="qualidade" v-if="qualidade" :chart="{
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                datasets: {
                  label: 'Qualidade',
                  data: [(qualidade.seg * 100).toFixed(2), (qualidade.ter * 100).toFixed(2), (qualidade.qua * 100).toFixed(2), (qualidade.qui * 100).toFixed(2), (qualidade.sex * 100).toFixed(2)],
                },
              }" />
            </chart-holder-card>
          </div>

          <div class="col-lg-4 col-md-12 col-sm-6 mt-lg-0 mt-4">
            <chart-holder-card title="Eficiência diária" subtitle="Eficiência diária" update="Atualizado diariamente"
              color="success">
              <reports-line-chart v-if="eficiencia" :chart="{
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                datasets: {
                  label: 'Eficiência diária',
                  data: [(eficiencia.seg * 100).toFixed(2), (eficiencia.ter * 100).toFixed(2), (eficiencia.qua * 100).toFixed(2), (eficiencia.qui * 100).toFixed(2), (eficiencia.sex * 100).toFixed(2)],
                },
              }" />
            </chart-holder-card>
          </div>
        </div>
      </div>
    </div>

    <h6 class="mb-0 font-weight-bolder">Destaques</h6>
    <div v-if="permissaoAdicionarMidia()" class="card p-2 mb-2">
      <input type="file" @change="pegaDestaque">
      <v-btn class="my-2" @click="adicionarDestaque">Adicionar Destaque</v-btn>
    </div>
    <v-carousel show-arrow="hover" cycle hide-delimiter-background class="col-lg-12 col-md-12 mb-4">
      <v-carousel-item v-for="item in showDestaques" :key="item.id" :src="openImagem(item.caminho)"
        cover></v-carousel-item>
    </v-carousel>

    <div class="row">
      <div class="col-lg-8 col-md-6 mb-md-0 mb-4">
        <distack-list title="Pense & Ajas" description="Destaques pense & ajas classse A"
          :headers="['Projeto', 'Turno', 'Realizado', 'Executor']" :projects="penseAjas" />
      </div>
      <div class="col-lg-4 col-md-6">
        <div v-if="permissaoAdicionarMidia()" class="card p-2 mb-2">
          <input type="file" @change="pegaPalavraGerencial">
          <v-btn class="my-2" @click="adicionarPalavraGerencial">Adicionar Palavra gerencial</v-btn>
        </div>
        <timeline-list class="h-100" title="Palavras gerenciais">
          <timeline-item v-for="item in showPalavraGerencial" :key="item.id" :icon="{
            component: 'article',
            class: 'text-primary',
          }" :title="item.titulo" :date-time="item.dateTime" @click="openPdf(item.caminho)" />
        </timeline-list>
      </div>
    </div>
  </div>
</template>
<script>
import ChartHolderCard from "./components/ChartHolderCard.vue";
import ReportsLineChart from "@/examples/Charts/ReportsLineChart.vue";
import MiniStatisticsCard from "./components/MiniStatisticsCard.vue";
import DistackList from "./components/DistackList.vue";
import TimelineList from "@/examples/Cards/TimelineList.vue";
import TimelineItem from "@/examples/Cards/TimelineItem.vue";
import axios from 'axios';
import ip from '../ip';
import VueJwtDecode from 'vue-jwt-decode';

export default {
  name: "inicio",
  components: {
    ChartHolderCard,
    ReportsLineChart,
    MiniStatisticsCard,
    DistackList,
    TimelineList,
    TimelineItem,
  },
  data() {
    return {

      titulos: null,
      eficiencia: null,
      producao: null,
      qualidade: null,
      usuario: [],
      penseAjas: [],

      imagem: null,
      palavraGerencial: null,
      showPalavraGerencial: [],
      destaque: null,
      showDestaques: [],
    };
  },
  mounted() {
    this.buscaDadosPlanilha()
    this.buscaPenseAja()

    this.buscaDestaques();
    this.buscaPalavrasGerenciais();
  },
  methods: {
    pegaPalavraGerencial(e) {
      this.palavraGerencial = e.target.files[0];
    },

    pegaDestaque(e) {
      this.destaque = e.target.files[0];
    },

    decodeJwt() {
      let token = sessionStorage.getItem('token');
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    permissaoAdicionarMidia() {
      if (this.decodeJwt()) {
        if (this.decodeJwt().setor === 'AUTOMACAO') {
          return true;
        }
        if (this.decodeJwt().setor === 'RH') {
          return true;
        }
      } else {
        return false;
      }
    },

    adicionarDestaque() {
      const formData = new FormData();
      formData.append('destaque', this.destaque);
      formData.append('usuario', this.decodeJwt().usuario);

      axios
        .post(`http://${ip}:3050/adicionarDestaque`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(() => {
          this.buscaDestaques()
        })
        .catch((error) => {
          console.error(error);
        })
    },

    buscaDestaques() {
      axios
        .get(`http://${ip}:3050/buscaDestaques`)
        .then((response) => {
          this.showDestaques = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    openImagem(caminho) {
      return `http://${ip}:3050/${caminho}`;
    },


    adicionarPalavraGerencial() {
      const formData = new FormData();
      formData.append('palavraGerencial', this.palavraGerencial);
      formData.append('usuario', this.decodeJwt().usuario);

      axios
        .post(`http://${ip}:3050/adicionarPalavraGerencial`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(() => {
          this.buscaPalavrasGerenciais()
        })
        .catch((error) => {
          console.error(error);
        });
    },

    buscaPalavrasGerenciais() {
      axios
        .get(`http://${ip}:3050/getPalavrasGerenciais`)
        .then((response) => {
          this.showPalavraGerencial = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    openPdf(caminho) {
      window.open(`http://${ip}:3050/${caminho}`, '_blank');
    },

    buscaPenseAja() {
      axios
        .get(`http://${ip}:3050/buscaPenseAja`)
        .then((response) => {
          this.penseAjas = response.data;
        })
        .catch((error) => {
          console.error("Erro ao trazer pense & ajas: ", error);
        })
    },
    buscaDadosPlanilha() {
      axios
        .get('https://script.google.com/macros/s/AKfycbzUImnJfixdqSinpNWVLFQH5XL5txDnk2kqLhuswirdMIOR61r9iTOohhnpqN_6VTbp8w/exec')
        .then(response => {
          this.data = response.data.saida;

          this.data.forEach((itens) => {

            if (itens.indicador === 'eficiencia') {
              this.eficiencia = itens;
            } else if (itens.indicador === 'producao') {
              this.producao = itens;
            } else if (itens.indicador === 'qualidade') {
              this.qualidade = itens;
            }
          });
        })
        .catch((error) => {
          console.error("Erro ao trazer dados da planilha: ", error);
        })
    },
  },  
};
</script>
