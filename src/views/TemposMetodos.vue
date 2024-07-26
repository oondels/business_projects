<template>
    <div class="container-fluid">
        <h5>Controles</h5>
        <div class="card rounded p-2 mb-4">
            <div class="col-12 row">
                <div class="col-lg-6 col-sm-12 d-flex align-items-center">
                    <div class="col-6">
                        <v-select label="Point" v-model="pointSelecionado"
                            @update:modelValue="buscaDadosDoSetor(pointSelecionado)" :items="points"
                            variant="outlined">
                        </v-select>
                    </div>
                    <div class="col-6 ms-2">
                        <v-btn @click="buscaDadosDoSetor(); pointSelecionado = null">Resetar</v-btn>
                    </div>
                </div>
                <div class="col-lg-6 col-sm-12 text-end align-content-center">
                    <router-link to="/tempos&metodos/point"><v-btn>Cadastrar produção</v-btn></router-link>
                </div>
            </div>
        </div>
        <h5>Performance</h5>
        <div class="row mt-4 mb-4">
            <div class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 mb-4">
                <chart-holder-card title="Tempo produtivo" subtitle="Total de tempo produtivo em segundos"
                    update="Atualizado diariamente" color="info">
                    <reports-line-chart v-if="mostraDadosGrafico" id="tempoProdutivo" :chart="{
                        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                        datasets: dadosGrafico.tempo_produtivo,
                    }" />
                </chart-holder-card>
            </div>

            <div class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4">
                <chart-holder-card title="Tempo excedente" subtitle="Total de tempo excedente em segundos"
                    update="Atualizado diariamente" color="danger">
                    <reports-line-chart v-if="mostraDadosGrafico" id="excedente" :chart="{
                        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                        datasets: dadosGrafico.tempo_excedente,
                    }" />
                </chart-holder-card>
            </div>

            <div class="col-lg-4 col-md-12 col-sm-12 mt-lg-0 mt-4 mb-4">
                <chart-holder-card title="Produção real" subtitle="Montante produzido nos points"
                    update="Atualizado diariamente" color="success">
                    <reports-line-chart v-if="mostraDadosGrafico" id="produzido" :chart="{
                        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                        datasets: dadosGrafico.producao,
                    }" />
                </chart-holder-card>
            </div>
        </div>

        <h5>Registros</h5>
        <ul class="lista-setores list-group p-0" @scroll="manipulaScroll">
            <li class="list-group-item bg-dark text-white">
                <div class="col-12 row">
                    <div class="text-center col-1">
                        <span>Point</span>
                    </div>
                    <div class="text-center col-3">
                        <span>Setor</span>
                    </div>
                    <div class="text-center col-2">
                        <span>Modelo</span>
                    </div>
                    <div class="text-center col-1">
                        <span>Produção</span>
                    </div>
                    <div class="text-center col-1">
                        <span>Tempo estimado</span>
                    </div>
                    <div class="text-center col-2">
                        <span>Parte</span>
                    </div>
                    <div class="text-center col-2">
                        <span>Cadastrante</span>
                    </div>
                </div>
            </li>
            <li class="list-group-item" v-for="setor in setores" :key="setor.id">
                <div class="col-12 row">
                    <div class="text-center col-1">
                        <span>{{ setor.point }}</span>
                    </div>
                    <div class="text-center col-3">
                        <span>{{ setor.setor_create }}</span>
                    </div>
                    <div class="text-center col-2">
                        <span>{{ setor.modelo }}</span>
                    </div>
                    <div class="text-center col-1">
                        <span>{{ setor.producao_indicada }}</span>
                    </div>
                    <div class="text-center col-1">
                        <span>{{ setor.tempo_estimado }}</span>
                    </div>
                    <div class="text-center col-2">
                        <span>{{ setor.parte }}</span>
                    </div>
                    <div class="text-center col-2">
                        <span>{{ setor.nome_create.split(" ")[0] + " " + setor.nome_create.split(" ").pop() }}</span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import ChartHolderCard from "./components/ChartHolderCard.vue";
import ReportsLineChart from "@/examples/Charts/ReportsLineChart.vue";

import axios from "axios";
import ip from "../ip";

export default {
    name: "tempos&metodos",

    components: {
        ChartHolderCard,
        ReportsLineChart,
    },

    data() {
        return {
            dadosGrafico: {},
            setores: {},

            pagina: 1,
            limitePagina: 15,
            setorAtual: null,
            carregando: false,
            temMais: true,

            points: [],
            pointSelecionado: '',

            mostraDadosGrafico: false,
        }
    },

    mounted() {
        this.buscaDadosGrafico();
        this.buscaPoints();
        this.buscaPrevisaoSetores();
    },

    methods: {

        buscaDadosDoSetor(point) {
            this.buscaDadosGrafico(point)
            this.setorAtual = point;
            this.page = 1;
            this.temMais = true;
            this.buscaPrevisaoSetores(point);
        },

        buscaDadosGrafico(setor) {
            this.mostraDadosGrafico = false;
            axios
                .get(`http://${ip}:3046/buscaDadosGrafico`, { params: { setor: setor } })
                .then((response) => {
                    this.dadosGrafico = response.data
                    this.mostraDadosGrafico = true;
                })
                .catch((error) => {
                    console.error("Erro ao trazer dados do gráfico: " + error);
                })
        },

        buscaPrevisaoSetores(point, pagina = 1) {
            if (this.carregando || !this.temMais) return;
            this.carregando = true;

            axios
                .get(`http://${ip}:3046/buscaPrevisaoSetores`, {
                    params: { point: point, pagina: pagina, limitePagina: this.limitePagina },
                })
                .then((response) => {
                    if (pagina === 1) {
                        this.setores = response.data;
                    } else {
                        this.setores = [...this.setores, ...response.data];
                    }
                    this.temMais = response.data.length === this.limitePagina;
                    this.carregando = false;
                })
                .catch((error) => {
                    console.error("Erro ao trazer setores: " + error);
                    this.carregando = false;
                });
        },

        manipulaScroll(event) {
            const bottom = (Math.round(event.target.scrollHeight - event.target.scrollTop) - 1) <= event.target.clientHeight;
            console.log(bottom);
            if (bottom) {
                this.pagina += 1;
                this.buscaPrevisaoSetores(this.setorAtual, this.pagina);
            }
        },

        buscaPoints() {
            axios
                .get(`http://${ip}:3046/buscaPoints`)
                .then((response) => {
                    this.points = response.data
                })
                .catch((error) => {
                    console.error("Erro ao buscar nome dos setores", error);
                })
        }
    }
}
</script>

<style>
.lista-setores {
    height: 30vh !important;
    overflow-y: auto;
}
</style>