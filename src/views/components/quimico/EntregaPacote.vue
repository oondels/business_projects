<template>
    <div class="col-12 row">
        <h5 class="col-8">Solicitações de Pacotes</h5>
        <v-btn v-if="permissoes" @click="baixaPlano()" class="col-4" text="Baixar"></v-btn>
    </div>

    <div class="col-12">
        <v-expansion-panels v-if="solicitacoesPacote.length" class="my-4 lista" variant="popout">
            <v-expansion-panel v-for="solicitacao in solicitacoesPacote" :key="solicitacao.id">
                <v-expansion-panel-title class="col-12 row p-1 m-0">
                    <div class="col-lg-1 d-flex flex-column">
                        <span class="col-lg-12 text-center text-xs rounded"
                            :class="solicitacao.abastecendo ? 'bg-success' : 'bg-warning'">
                            {{ solicitacao.abastecendo ? 'Iniciado' : 'Pendente' }}
                        </span>
                        <span v-if="solicitacao.cancelado"
                            class="mt-1 col-lg-12 text-center text-xs rounded bg-danger text-white">
                            Cancelado
                        </span>
                    </div>
                    <span class="col-sm-2 col-lg-1 text-sm">{{ solicitacao.celula }}</span>
                    <span class="col-lg-2 text-sm">{{ solicitacao.processo }}</span>
                    <span class="col-lg-2 text-sm">{{ solicitacao.modelo }}</span>
                    <span class="col-lg-1 text-sm text-center">{{ solicitacao.producao }}</span>
                    <span class="col-lg-2 text-sm text-center">{{ solicitacao.turno }}</span>
                    <span class="col-lg-2 text-sm text-end">{{ dataFormatada(solicitacao.createdate) }}</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="border-top">
                    <div class="col-12">
                        <v-card-actions class="bg-light rounded mb-2" v-if="!solicitacao.cancelado">
                            <h4 class="m-0">Cancelar solicitação</h4>
                            <v-spacer></v-spacer>
                            <v-select density="compact" class="me-2" variant="outlined" label="Motivo" :items="motivos" v-model="motivoSelecionado"></v-select>
                            <v-text-field density="compact" variant="outlined" class="me-2" type="number"
                                v-model="matriculaDelete" label="Matrícula" placeholder="Insira a matrícula para apagar" hide-details></v-text-field>
                            <v-btn @click="cancelarSolicitacao(solicitacao.id, matriculaDelete, motivoSelecionado)" color="error"
                                variant="flat" text="Cancelar"></v-btn>
                        </v-card-actions>
                        <div v-if="permissoes">
                            <div class="col-12 p-0 m-0 bg-info card mb-2 rounded"
                                v-for="produto in solicitacao.produtos" :key="produto.id">
                                <div class="col-12 row px-1">
                                    <span class="col-8"><strong>Produto:</strong> {{ produto.produto }}</span>
                                    <span class="col-2"><strong>Base:</strong> {{ produto.base }}</span>
                                    <span class="col-2 text-center">
                                        <strong>Recipientes:</strong> {{ produto.recipientes }}
                                    </span>
                                </div>
                                <div v-if="solicitacao.abastecendo" class="col-12 row p-0 m-0 py-2 bg-white">
                                    <v-text-field v-for="(label, index) in horariosLabels" :key="index"
                                        :class="['col-2', { 'text-center': index < 4 }]" :label="label"
                                        :disabled="index < 4" density="compact" type="number" variant="outlined"
                                        v-model="getAbastecimentoModel(solicitacao.id, produto.id)[label]"></v-text-field>
                                </div>
                            </div>
                        </div>
                        <v-card-actions v-if="permissoes">
                            <v-spacer></v-spacer>
                            <v-btn v-if="!solicitacao.abastecendo && !solicitacao.cancelado"
                                @click="manipulaAbastecimento(solicitacao.id, 'inicio')" color="warning" variant="flat"
                                text="Iniciar abastecimento"></v-btn>
                            <v-btn v-if="solicitacao.abastecendo && !solicitacao.cancelado" @click="manipulaAbastecimento(solicitacao.id, 'fim')"
                                color="success" variant="flat" text="Fechar pedido"></v-btn>
                            <v-btn v-if="solicitacao.cancelado" class="text-white" color="danger" variant="flat" text="Excluír"
                                @click="excluiSolicitacao(solicitacao.id)"></v-btn>
                        </v-card-actions>
                    </div>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
        <div v-else>
            <p>Nenhuma solicitação encontrada.</p>
        </div>
    </div>
    <alert ref="alert" />
</template>

<script>
import axios from "axios";
import ip from "../../../ip";
import VueJwtDecode from "vue-jwt-decode"
import Alert from '../Alert.vue';
import { format } from "date-fns";

export default {
    name: "entrega-pacote",

    props: {
        permissoes: Boolean,
    },

    data() {
        return {
            solicitacoesPacote: [],
            abastecimentos: [],

            matriculaDelete: [],

            motivos: ['Aumento de produção', 'Consumo', 'Divergencia com a previsão', 'Hora extra', 'Numeração maior','Planejamento', 'Reposição', 'Troca de modelo'],
            motivoSelecionado: '',

            final: null,
            residuo: null,
        }
    },

    mounted() {
        this.buscaSolicitacoes()
    },

    computed: {
        horariosLabels() {
            return ["1° Horário", "2° Horário", "3° Horário", "4° Horário", "Final", "Resíduo"];
        },
    },

    methods: {
        excluiSolicitacao(id) {
            axios
                .put(`http://${ip}:3045/excluiSolicitacao`, { id })
                .then((response) => {
                    this.$refs.alert.mostrarAlerta('success', 'fas fa-thumbs-up', 'Sucesso', response.data);
                    window.location.reload();
                })
                .catch((error) => {
                    const errorMessage = error.response ? error.response.data : 'Erro desconhecido';
                    this.$refs.alert.mostrarAlerta('warning', 'fas fa-thumbs-down', 'Erro', errorMessage);
                })
        },

        cancelarSolicitacao(id, matricula, motivoSelecionado) {
            axios
                .put(`http://${ip}:3045/cancelarSolicitacao`, { id, matricula, motivoSelecionado })
                .then(() => {
                    this.buscaSolicitacoes();
                })
                .catch((error) => {
                    const errorMessage = error.response ? error.response.data : 'Erro desconhecido';
                    this.$refs.alert.mostrarAlerta('warning', 'fas fa-thumbs-down', 'Erro', errorMessage);
                })
        },

        baixaPlano() {
            axios({
                url: `http://${ip}:3045/xlsxPacotes`,
                method: 'GET',
                responseType: 'blob',
            })
                .then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]))
                    const link = document.createElement('a');
                    link.href = url;

                    let data = new Date();
                    let dia = data.getDay();
                    let mes = data.getMonth();
                    let ano = data.getFullYear();
                    let Hora = data.getHours();
                    let minutos = data.getMinutes();

                    link.setAttribute('download', `solicitacoes ${dia}-${mes}-${ano} ${Hora}:${minutos}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                })
                .catch((error) => {
                    console.error("Erro ao buscar solicitações", error.response ? error.response.status : error.message);
                });
        },

        getAbastecimentoModel(solicitacaoId, produtoId) {
            if (!Array.isArray(this.abastecimentos)) {
                this.abastecimentos = [];
            }

            let produto = this.abastecimentos.find(p => p.id === produtoId && p.solicitacaoId === solicitacaoId);
            if (!produto) {

                let solicitacao = this.solicitacoesPacote.find(s => s.id === solicitacaoId);
                if (solicitacao) {
                    let produtoData = solicitacao.produtos.find(p => p.id === produtoId);
                    if (produtoData) {

                        let totalFinal = produtoData.consumo_previo * solicitacao.producao;
                        let consumoPrevio = totalFinal / 4;

                        produto = {
                            produto: produtoData.produto,
                            consumo_previo: produtoData.consumo_previo,
                            preco_kg: produtoData.preco_kg,
                            "1° Horário": consumoPrevio.toFixed(2),
                            "2° Horário": consumoPrevio.toFixed(2),
                            "3° Horário": consumoPrevio.toFixed(2),
                            "4° Horário": consumoPrevio.toFixed(2),
                            Final: totalFinal.toFixed(2),
                            Resíduo: null,
                            abastecedor: this.decodeJwt().usuario,
                            celula: solicitacao.celula,
                            mes: new Date().getMonth(),
                            modelo: solicitacao.modelo,
                            processo: solicitacao.processo,
                            gerente: solicitacao.gerente,
                            createdate: solicitacao.createdate,
                            fabrica: solicitacao.fabrica,
                            id: produtoId,
                            solicitacaoId: solicitacaoId,
                        };

                        this.abastecimentos.push(produto);
                    }
                }
            }
            return produto;
        },

        manipulaAbastecimento(id, instrucao) {

            const abastecimento = {
                id: id,
                usuario: this.decodeJwt().usuario,
                instrucao: instrucao,
                abastecimentos: JSON.stringify(this.abastecimentos),
            }

            axios
                .post(`http://${ip}:3045/manipulaAbastecimento`, {
                    abastecimento
                })
                .then(() => {
                    this.abastecimentos = {};
                    if (instrucao === 'inicio') {
                        return this.buscaSolicitacoes();
                    }
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Erro ao iniciar abastecimento", error.response.status);
                })
        },

        buscaSolicitacoes() {
            axios
                .get(`http://${ip}:3045/pacoteSolicitacao`)
                .then((response) => {
                    this.solicitacoesPacote = response.data
                })
                .catch((error) => {
                    console.error("Erro ao buscar solicitações", error.response ? error.response.status : error.message);
                });
        },

        decodeJwt() {
            let token = sessionStorage.getItem('token');
            if (token) {
                return VueJwtDecode.decode(token);
            }
        },

        dataFormatada(data) {
            return format(new Date(data), 'dd/MM, HH:mm')
        },
    },

    components: {
        Alert,
    },
}
</script>

<style>
.lista {
    max-height: 1000px;
    overflow-y: auto;
}

.v-expansion-panel-title__icon {
    display: none !important;
}

.v-input__details {
    display: none !important;
}
</style>