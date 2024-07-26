<template>
    <div class="container-fluid">
        <div class="col-12 row">
            <div class="col-lg-7 col-sm-12 mb-4">
                <div class="card z-index-2 mb-5">
                    <gradient-line-chart v-if="showChart" id="performance1" title="Medidor de performance 2024"
                        :description="`Performance ${referenciaGrafico ? referenciaGrafico : 'global da unidade'}`"
                        :chart="chartData" />
                </div>
                <div class="card">
                    <ranking-list-card :horizontal-break="false" :card="{
                        title: 'Top 5 gerentes',
                        subtitle: 'Ranking do mês',
                    }" :item="ranking">
                    </ranking-list-card>
                </div>
            </div>
            <div class="col-lg-5 col-sm-12">
                <listagem-setor :criterios="criterios" :auditorias="auditorias"
                    @atualizar-informacao="atualizarInformacao" @inserir-filtro="inserirFiltro"
                    @paginacao="handlePaginacao" />
            </div>
        </div>
    </div>
</template>

<script>
import setTooltip from "@/assets/js/tooltip.js";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue"
import ListagemSetor from "./components/ListagemSetor.vue"
import RankingListCard from "@/examples/Cards/RankingListCard.vue";
import ip from "../ip"
import axios from "axios";

export default {
    name: "ferramentas-lean",
    components: {
        GradientLineChart,
        ListagemSetor,
        RankingListCard,
    },
    data() {
        return {
            auditorias: [],
            criterios: [],
            dadosGrafico: [],
            ranking: [],
            color: '',
            showChart: false,
            chartData: {},
            referenciaGrafico: '',
            open: ['Users'],
            admins: [
                ['Management', 'mdi-account-multiple-outline'],
                ['Settings', 'mdi-cog-outline'],
            ],
            cruds: [
                ['Create', 'mdi-plus-outline'],
                ['Read', 'mdi-file-outline'],
                ['Update', 'mdi-update'],
                ['Delete', 'mdi-delete'],
            ],
        };
    },
    mounted() {
        this.buscaCriterio();
        this.buscaAuditoria();
        this.buscaDadosGlobais();
        this.buscaDadosRaking();

        setTooltip();
    },
    methods: {
        handlePaginacao(filtroAtivado, paginaAtual) {
            this.buscaAuditoria(filtroAtivado, paginaAtual + 1)
        },

        atualizarInformacao() {
            this.buscaCriterio()
            this.buscaAuditoria()
            this.buscaDadosRaking()
        },

        inserirFiltro(gerente, data) {
            this.referenciaGrafico = gerente;
            this.buscaDadosGlobais(gerente, data)
            this.buscaAuditoria(gerente, '', '', data)
        },

        buscaCriterio() {
            axios
                .get(`http://${ip}:3049/buscaCriteriosAuditoria`)
                .then(response => {
                    this.criterios = response.data
                })
                .catch(error => {
                    console.error('Erro ao buscar os critérios: ', error);
                });
        },

        buscaAuditoria(gerente, pagina = 1, tamanhoPagina = 30, data) {
            axios
                .get(`http://${ip}:3049/buscaAuditorias`, { params: { gerente: gerente, pagina: pagina, tamanhoPagina: tamanhoPagina, data: data } })
                .then(response => {
                    this.auditorias = response.data;
                })
                .catch(error => {
                    console.error('Erro ao buscar auditorias: ', error);
                });
        },

        buscaDadosGlobais(gerente, data) {
            this.showChart = false;
            axios
                .get(`http://${ip}:3049/buscaDadoGlobaisAuditorias`, { params: { gerente: gerente, data: data } })
                .then(response => {
                    this.dadosGrafico = response.data;
                    this.processChartData();
                    this.showChart = true;
                })
                .catch(error => {
                    console.error('Erro ao buscar dados do gráfico: ', error);
                });
        },

        buscaDadosRaking() {
            axios
                .get(`http://${ip}:3049/buscaDadoRankingAuditorias`)
                .then(response => {
                    this.ranking = response.data;
                })
                .catch(error => {
                    console.error('Erro ao buscar ranking: ', error);
                });
        },

        processChartData() {
            this.chartData = {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [
                    {
                        label: 'Auditorias realizadas',
                        data: Array(12).fill(),
                    },
                    {
                        label: 'Percentual médio de aproveitamento',
                        data: Array(12).fill(),
                    }
                ],
            }

            this.dadosGrafico.forEach(dado => {
                const monthIndex = parseInt(dado.mes) - 1;
                const quantidadeRegistros = parseInt(dado.quantidade_registros);
                const somaPontuacao = parseInt(dado.soma_pontuacao);

                this.chartData.datasets[0].data[monthIndex] = quantidadeRegistros;
                this.chartData.datasets[1].data[monthIndex] = somaPontuacao.toFixed(2);
            });
        },
    },
}
</script>