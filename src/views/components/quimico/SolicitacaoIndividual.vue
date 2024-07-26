<template>
    <v-dialog max-width="800">

        <template v-slot:activator="{ props: activatorProps }">
            <div v-bind="activatorProps" class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
                <mini-statistics-card :title="{ text: 'Solicitação Individual' }" :icon="{
                    name: 'crop_square',
                    color: 'text-white',
                    background: 'primary',
                }" />
            </div>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-card-title class="text-center border-bottom position-sticky fixed-top border-bottom bg-white">
                    <h3>Solicitação de químico individual</h3>
                </v-card-title>
                <v-card-item>
                    <div class="col-12 row">
                        <div class="col-6">
                            <v-select :items="dadosProduto" return-object item-title="produto" item-value="dados"
                                label="Produto" v-model="dadosProdutoSelecionado" @click="buscaProdutosCadastrados"
                                @update:modelValue="atribuiProdutoSolicitacao(dadosProdutoSelecionado)"></v-select>
                        </div>
                        <div class="col-6">
                            <v-text-field type="number" label="Quantidade de recipientes"
                                v-model="solicitacao.recipientes"></v-text-field>
                        </div>
                        <div class="col-6">
                            <v-text-field type="number" label="Célula" v-model="solicitacao.celula"></v-text-field>
                        </div>
                        <div class="col-6">
                            <v-select :items="['APOIO', 'FILA', 'NIKE']" v-model="marcaSelecionada"
                                label="Marca"></v-select>
                        </div>
                        <div class="col-6">
                            <v-select :items="motivos" v-model="motivoSelecionado" label="Motivo"></v-select>
                        </div>
                        <div class="col-6">
                            <v-text-field type="number" :rules="matriculaRules" label="Matrícula"
                                v-model="solicitacao.matricula"
                                @keyup="buscaSolicitante(solicitacao.matricula)"></v-text-field>
                        </div>
                        <div class="col-6">
                            <v-text-field type="text" disabled label="Nome" v-model="solicitacao.nome"></v-text-field>
                        </div>
                    </div>
                </v-card-item>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="danger" text="Fechar" variant="tonal"
                        @click="isActive.value = false; zerarSolicitacao"></v-btn>
                    <v-btn color="success" text="Salvar" @click="salvarSolicitacao" variant="tonal"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

    <alert ref="alert" />
</template>

<script>
import axios from "axios";
import MiniStatisticsCard from "../MiniStatisticsCard.vue"
import ip from "../../../ip";
import VueJwtDecode from "vue-jwt-decode"
import Alert from '../Alert.vue';

export default {
    name: "solicitacao-individual",
    emits: ['atualiza-solicitacoes'],
    data() {
        return {
            solicitacao: {
                produto: '',
                idProduto: null,
                preco_kg: null,
                recipientes: null,
                celula: null,
                turno: '',
                nome: '',
                matricula: null,
                gerente: '',
                marca: '',
                motivo: '',
            },

            matriculaRules: [value => (value && value.length >= 7) || 'Insira seu crachá completo'],

            dadosProduto: [],
            dadosProdutoSelecionado: null,
            dadosModeloSelecionado: null,

            motivos: ['Aumento de produção', 'Consumo', 'Divergencia com a previsão', 'Hora extra', 'Numeração maior', 'Planejamento', 'Reposição', 'Troca de modelo'],
            motivoSelecionado: '',
            marcaSelecionada: '',
        }
    },
    mounted() {
        this.buscaProdutosCadastrados();
    },
    methods: {
        atribuiProdutoSolicitacao(produtoSelecionado) {
            this.solicitacao.produto = produtoSelecionado.produto
            this.solicitacao.idProduto = produtoSelecionado.dados.id
            this.solicitacao.preco_kg = produtoSelecionado.dados.preco_kg
        },

        turno() {
            const dataAtual = new Date();
            if (dataAtual.getHours() > 14) {
                return 'TURNO B'
            }
            return 'TURNO A'
        },

        buscaProdutosCadastrados() {
            axios
                .get(`http://${ip}:3045/buscaProdutosCadastrados`)
                .then((response) => {
                    this.dadosProduto = response.data
                })
                .catch((error) => {
                    console.error("Erro ao buscar ProdutosCadastrados", error.response);
                })
        },

        buscaSolicitante(matricula) {
            if (matricula && matricula.length === 7) {
                axios
                    .get(`http://${ip}:3045/buscaSolicitante`, { params: { matricula: matricula } })
                    .then((response) => {
                        this.solicitacao.nome = response.data.nome
                        this.solicitacao.gerente = response.data.gerente
                    })
                    .catch((error) => {
                        console.error("Erro ao buscar solicitante", error.response);
                    })
            }
        },

        salvarSolicitacao() {
            this.solicitacao.turno = this.turno()
            this.solicitacao.marca = this.marcaSelecionada
            this.solicitacao.motivo = this.motivoSelecionado

            axios
                .post(`http://${ip}:3045/salvarSolicitacaoIndividual`, {
                    solicitacao: this.solicitacao
                })
                .then(() => {
                    this.$refs.alert.mostrarAlerta('success', 'fas fa-thumbs-up', 'sucesso', 'Solicitação salva com sucesso!')
                    this.zerarSolicitacao()
                    this.$emit('atualiza-solicitacoes', 'individual')
                })
                .catch((error) => {
                    this.$refs.alert.mostrarAlerta('warning', 'fas fa-exclamation', 'Atenção', error.response.data)
                })
        },

        decodeJwt() {
            let token = sessionStorage.getItem('token');
            if (token) {
                return VueJwtDecode.decode(token);
            }
        },

        zerarSolicitacao() {
            this.solicitacao = {}
            this.dadosProdutoSelecionado = null
        }
    },

    components: {
        MiniStatisticsCard,
        Alert,
    },
}
</script>