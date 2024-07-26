<template>
    <div class="container mb-4 border-bottom">
        <h5 class="mb-4">Ações</h5>
        <div class="m-0 mb-4 row col-12">
            <solicitacao-pacote @atualiza-solicitacoes="atualizaSolicitacoes" />

            <solicitacao-individual @atualiza-solicitacoes="atualizaSolicitacoes" />

            <abastecimento-recorrente v-if="permissoes()" />
        </div>
        <div class="m-0 mb-4 row">
            <cadastro-modelo v-if="permissoes()" />

            <edicao-produto v-if="permissoes()" />

            <autorizar-cracha v-if="permissoes()" />
        </div>

        <entrega-pacote :permissoes="permissoes()" ref="entregaPacote" />

        <entrega-individual :permissoes="permissoes()" ref="entregaIndividual" />
    </div>

    <div class="container-fluid">
        <div class="col-12 row p-0 m-0 mb-2">
            <h5 class="col-6">Medidores de performance</h5>

            <div class="col-6 row">
                <v-select density="compact" class="col-4 text-black" variant="outlined"
                    :items="['', 'Fabrica', 'Gerente', 'Marca', 'Modelo', 'Processo']" return-object item-title="titulo"
                    item-value="consulta" label="Filtro Categoria" v-model="categoriaSelecionada"
                    @update:modelValue="filtrosPerformance(categoriaSelecionada, individualSelecionado = '', produtoSelecionado = ''); buscaFiltrosIndividuais(categoriaSelecionada)"></v-select>

                <v-select density="compact" class="col-4 text-black" variant="outlined" :disabled="!individual"
                    :items="individual" return-object item-title="valor" item-value="titulo"
                    v-model="individualSelecionado"
                    @update:modelValue="filtrosPerformance(categoriaSelecionada, individualSelecionado, produtoSelecionado)"
                    label="Filtro Individual"></v-select>

                <v-select density="compact" class="col-4 text-black" variant="outlined" :disabled="!individual"
                    :items="produtos" return-object item-title="valor" item-value="titulo" v-model="produtoSelecionado"
                    @update:modelValue="filtrosPerformance(categoriaSelecionada, individualSelecionado, produtoSelecionado)"
                    label="Filtro Produto"></v-select>
            </div>
        </div>

        <gradient-line-chart v-if="mostrarGrafico" :customClass="'rounded bg-gradient-dark text-white'"
            :title="'Totais: Gasto(R$) X Consumo(Kg)'" :titleStyle="'text-white p-0'" :description="descricaoPerformance"
            id="grafico" :chart="graficoTotalConsumoGasto" />

        <div class="col-12 p-0 m-0 mb-2 row">
            <div class="col-lg-6 col-sm-12">
                <gradient-line-chart v-if="mostrarGrafico" :customClass="'rounded bg-gradient-dark text-white'"
                    :title="'Consumo em Kg'" :titleStyle="'text-white p-0'" :description="descricaoPerformance"
                    id="graficoTotalProdutivoResiduoKG" :chart="graficoTotalProdutivoResiduoKG" />
            </div>

            <div class="col-lg-6 col-sm-12'">
                <gradient-line-chart v-if="mostrarGrafico" :customClass="'rounded bg-gradient-dark text-white'"
                    :title="'Consumo em R$'" :titleStyle="'text-white p-0'" :description="descricaoPerformance"
                    id="graficoTotalProdutivoResiduoRS" :chart="graficoTotalProdutivoResiduoRS" />
            </div>
        </div>

        <div class="col-12 row mb-2">
            <h5 class="col-3 align-content-center m-0">Solicitações concluídas</h5>

            <div class="col-9 row">
                <v-select class="text-black col-2" density="compact" variant="outlined" label="Tipo"
                    :items="['', 'Pacotes', 'Individuais']" v-model="tipo"
                    @update:modelValue="buscaTodasSolicitacoes()"></v-select>
                <v-select class="text-black col-2" density="compact" variant="outlined" label="Turno"
                    :items="['', 'TURNO A', 'TURNO B']" v-model="turno"
                    @update:modelValue="buscaTodasSolicitacoes()"></v-select>
                <v-select class="text-black col-2" density="compact" variant="outlined" label="Gerente"
                    :items="gerentes" v-model="gerenteSelecionado"
                    @update:modelValue="buscaTodasSolicitacoes()"></v-select>
                <v-text-field type="date" class="text-black col-2" density="compact" variant="outlined" label="Data"
                    v-model="data" @update:modelValue="buscaTodasSolicitacoes()"></v-text-field>
                <v-text-field density="compact" class="text-black col-2" variant="outlined" label="Célula"
                    v-model="celula" @keyup="buscaTodasSolicitacoes()"></v-text-field>
            </div>
        </div>

        <ul class="lis-group p-0 rounded lista" v-if="mostraSolicitacoes">
            <li class="list-group-item border bg-black">
                <div class="sticky-top col-12 row">
                    <div class="col-1">
                        <span>Tipo</span>
                    </div>
                    <div class="col-1">
                        <span>Célula</span>
                    </div>
                    <div class="col-2">
                        <span>Turno</span>
                    </div>
                    <div class="col-2">
                        <span>Solicitante</span>
                    </div>
                    <div class="col-2 align-content-center">
                        <span>Gerente</span>
                    </div>
                    <div class="col-2 text-center">
                        <span>Custo em resíduos</span>
                    </div>
                    <div class="col-2 text-center">
                        <span>Custo produtivo</span>
                    </div>
                </div>
            </li>
            <li class="list-group-item" v-for="solicitacao in solicitacoes" :key="solicitacao.id">
                <div class="col-12 row">
                    <div class="col-1">
                        <span>{{ tipo }}</span>
                    </div>
                    <div class="col-1">
                        <span>{{ solicitacao.celula }}</span>
                    </div>
                    <div class="col-2">
                        <span>{{ solicitacao.turno }}</span>
                    </div>
                    <div class="col-2">
                        <span>
                            {{ solicitacao.nome_solicitante.split(" ")[0]
                                + " " +
                                solicitacao.nome_solicitante.split(" ").pop()
                            }}
                        </span>
                    </div>
                    <div class="col-2">
                        <span>
                            {{ solicitacao.gerente.split(" ")[0]
                                + " " +
                                solicitacao.gerente.split(" ").pop()
                            }}
                        </span>
                    </div>
                    <div class="col-2 d-flex flex-column text-center">
                        <span>KG {{ Number(solicitacao.residuo).toFixed(2) }}</span>
                        <span>R$ {{ Number(solicitacao.custo_residuo).toFixed(2) }}</span>
                    </div>
                    <div class="col-2 d-flex flex-column text-center">
                        <span>KG {{ Number(solicitacao.abastecido).toFixed(2) }}</span>
                        <span>R$ {{ Number(solicitacao.custo_produtivo).toFixed(2) }}</span>
                    </div>
                </div>
            </li>
        </ul>
        <div v-if="!mostraSolicitacoes">
            <p class="text-black">Nenhuma solicitação encontrada com o filtro definido</p>
        </div>

    </div>
    <alert ref="alert" />
</template>

<script>
import VueJwtDecode from "vue-jwt-decode";
import Alert from './components/Alert.vue';
import CadastroModelo from './components/quimico/CadastroModelo.vue';
import SolicitacaoIndividual from './components/quimico/SolicitacaoIndividual.vue';
import EntregaPacote from "./components/quimico/EntregaPacote.vue";
import EntregaIndividual from "./components/quimico/EntregaIndividual.vue";
import SolicitacaoPacote from "./components/quimico/SolicitacaoPacote.vue";
import EdicaoProduto from "./components/quimico/EdicaoProduto.vue";
import AbastecimentoRecorrente from "./components/quimico/AbastecimentoRecorrente.vue";
import AutorizarCracha from "./components/quimico/AutorizarCracha.vue";

import GradientLineChart from "@/examples/Charts/GradientLineChart.vue"

import axios from "axios";
import ip from "../ip";

export default {
    name: "quimico",

    data() {
        return {
            resultadoProcesso: [],

            mostrarGrafico: false,
            mostraSolicitacoes: false,

            graficoTotalProdutivoResiduoKG: {},
            graficoTotalProdutivoResiduoRS: {},
            graficoTotalConsumoGasto: {},

            individual: [],
            produtos: [],

            categoriaSelecionada: '',
            individualSelecionado: '',
            produtoSelecionado: '',

            descricaoPerformance: '',

            message: '',
            input: '',
            socket: null,

            solicitacoes: [],
            tipo: 'Pacotes',
            gerentes: [],

            gerenteSelecionado: '',
            data: new Date().getFullYear() + "-"
                + String(new Date().getMonth() + 1).padStart(2, '0') + "-"
                + String(new Date().getDate()).padStart(2, '0'),
            turno: '',
            celula: '',
        }
    },

    mounted() {
        this.buscarDadosProdutos();
        this.buscaTodasSolicitacoes();

        this.socket = new WebSocket(`ws://${ip}:3045`);

        this.socket.onmessage = (event) => {
            if (event.data === 'individual') {
                this.$refs.entregaIndividual.buscaSolicitacoes()
            }
            if (event.data === 'pacote') {
                this.$refs.entregaPacote.buscaSolicitacoes()
            }
        };
    },

    methods: {
        atualizaSolicitacoes(tipo) {
            this.sendMessage(tipo);
        },
        sendMessage(tipo) {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(tipo);
            } else {
                console.error('WebSocket não está aberto');
            }
        },

        filtrosPerformance(categoria, individual, produto) {
            this.descricaoPerformance = `${categoria} ${individual.valor ? individual.valor : ''}`
            this.buscarDadosProdutos(categoria, individual, produto)
        },

        buscaTodasSolicitacoes() {
            this.mostraSolicitacoes = false;
            axios
                .get(`http://${ip}:3045/solicitacoes`, {
                    params: {
                        tipo: this.tipo.toLocaleLowerCase(),
                        turno: this.turno,
                        gerente: this.gerenteSelecionado,
                        data: this.data,
                        celula: this.celula
                    }
                })
                .then((response) => {
                    this.solicitacoes = response.data.solicitacoes;
                    this.gerentes = response.data.gerentes;
                    this.ano = response.data.ano;
                    this.mes = response.data.mes;

                    this.mostraSolicitacoes = true
                })
                .catch((error) => {
                    console.error("Erro ao buscar Solicitacoes", error.response);
                })

        },

        buscaFiltrosIndividuais(categoria) {
            axios
                .get(`http://${ip}:3045/buscaFiltrosIndividuais`, { params: { categoria: categoria } })
                .then((response) => {
                    this.individual = response.data
                })
                .catch((error) => {
                    console.error("Erro ao buscar FiltrosIndividuais", error.response);
                })
        },

        buscarDadosProdutos(categoria, individual, produto) {
            this.mostrarGrafico = false;
            axios
                .get(`http://${ip}:3045/buscaDadosProdutos`, { params: { categoria: categoria, individual: individual, produto: produto } })
                .then((response) => {

                    this.graficoTotalConsumoGasto = response.data.graficoTotalConsumoGasto;
                    this.graficoTotalProdutivoResiduoKG = response.data.graficoTotalProdutivoResiduoKG;
                    this.graficoTotalProdutivoResiduoRS = response.data.graficoTotalProdutivoResiduoRS;

                    this.produtos = response.data.produtos;

                    this.mostrarGrafico = true;
                })
                .catch((error) => {
                    console.error("Erro ao buscar DadosProdutos", error.response);
                })
        },

        permissoes() {
            if (this.decodeJwt() && (this.decodeJwt().setor === 'AUTOMACAO' || this.decodeJwt().setor === 'QUIMICO')) {
                return true
            }
            return false
        },

        decodeJwt() {
            let token = sessionStorage.getItem('token');
            if (token) {
                return VueJwtDecode.decode(token);
            }
        },
    },
    components: {
        Alert,
        CadastroModelo,
        SolicitacaoPacote,
        SolicitacaoIndividual,
        AutorizarCracha,
        EntregaPacote,
        EntregaIndividual,
        GradientLineChart,
        EdicaoProduto,
        AbastecimentoRecorrente,
    },
}
</script>

<style>
.lista {
    max-height: 300px;
    overflow-y: auto;
}
</style>