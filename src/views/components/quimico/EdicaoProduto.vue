<template>
    <v-dialog max-width="1000">
        <template v-slot:activator="{ props: activatorProps }">
            <div v-bind="activatorProps" class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
                <mini-statistics-card :title="{ text: 'Edição de produto' }" :icon="{
                    name: 'edit_note',
                    color: 'text-white',
                    background: 'dark',
                }" />
            </div>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-card-title class="position-sticky fixed-top border-bottom d-flex justify-content-between bg-white">
                    <h3 class="col-5">Edição de produtos</h3>

                    <v-select class="col-2 px-1" density="compact" :items="processos" label="Processo" hide-details
                        variant="solo" v-model="processo"
                        @update:modelValue="buscaModelosCadastrados(processo)"></v-select>

                    <v-select class="col-2 px-1" density="compact" :disabled="!processo" :items="modelos" hide-details
                        variant="solo" label="Modelo" v-model="modelo"
                        @update:modelValue="filtraProdutos(processo, modelo);"></v-select>

                    <v-text-field :disabled="!processo" density="compact" append-inner-icon="mdi-magnify"
                        :loading="loading" class="col-2 px-1" hide-details variant="solo" clearable v-model="pesquisa"
                        @keyup="filtraProdutos(processo, modelo, pesquisa)" placeholder="Pesquisar"></v-text-field>

                    <i @click="isActive.value = false"
                        class="material-icons-round cursor-pointer text-danger text-end align-content-center opacity-10 fs-1 col-1">cancel</i>
                </v-card-title>
                <v-card-item v-if="loaded">
                    <ul class="list-group  mb-2">



                        <li class="list-group-item" v-for="(produto, indice) in produtos" :key="produto.id">
                            <div class="col-12 row m-0 p-0">
                                <div class="col-10 row m-0 p-0">
                                    <v-text-field placeholder="Produto" density="compact" variant="plain"
                                        v-model="produto.produto" class="col-4 px-1"></v-text-field>
                                    <v-text-field disabled placeholder="Processo" density="compact" variant="plain"
                                        v-model="produto.processo" class="col-2 px-1"></v-text-field>
                                    <v-text-field disabled placeholder="Modelo" density="compact" variant="plain"
                                        v-model="produto.modelo" class="col-3 px-1"></v-text-field>
                                    <v-text-field placeholder="Recipientes" density="compact" variant="plain"
                                        v-model="produto.recipientes" class="col-1 px-1"></v-text-field>
                                    <v-text-field placeholder="Consumo prévio" density="compact" variant="plain"
                                        v-model="produto.consumo_previo" class="col-1 px-1"></v-text-field>
                                    <v-text-field placeholder="Preço KG" density="compact" variant="plain"
                                        v-model="produto.preco_kg" class="col-1 px-1"></v-text-field>
                                </div>
                                <div class="col-2 row m-0">
                                    <i v-if="!produto.novoProduto" @click="editarProduto(produto);"
                                        class="material-icons-round cursor-pointer text-success opacity-10 fs-4 col-4 text-start align-content-center">edit</i>
                                    <i v-if="!produto.novoProduto" @click="adicionarProduto(produto)"
                                        class="material-icons-round cursor-pointer text-info opacity-10 fs-4 col-4 text-center align-content-center">difference</i>
                                    <i v-if="produto.novoProduto" @click="salvarProduto(produto)"
                                        class="material-icons-round cursor-pointer text-success opacity-10 fs-4 col-6 text-center align-content-center">save</i>
                                    <i v-if="produto.novoProduto" @click="removerNovoProduto(indice)"
                                        class="material-icons-round cursor-pointer text-danger opacity-10 fs-4 col-6 text-center align-content-center">cancel</i>
                                    <i v-if="!produto.novoProduto" @click="apagarProduto(produto)"
                                        class="material-icons-round cursor-pointer text-danger opacity-10 fs-4 col-4 text-end align-content-center">delete</i>
                                </div>
                            </div>
                        </li>
                    </ul>
                </v-card-item>
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
    name: "edicao-produto",
    data() {
        return {
            produtos: {
                produto: '',
                modelo: '',
                processo: '',
                recipientes: '',
                consumo_previo: '',
                preco_kg: '',
                base: '',
                usuariocreate: '',
                id_modelo: '',
                novoProduto: false,
            },

            processos: [],
            modelos: [],

            processo: '',
            modelo: '',
            pesquisa: '',

            desabilidado: true,

            loading: false,
            loaded: false,
        }
    },

    mounted() {
        this.buscaProcessosCadastrados();
    },

    methods: {
        editarProduto(produto) {
            axios
                .put(`http://${ip}:3045/manipularProduto`, produto)
                .then(() => {
                    this.filtraProdutos(this.processo, this.modelo, this.pesquisa)
                })
                .catch((error) => {
                    console.error("Erro ao editar produto", error.response);
                });
        },

        apagarProduto(produto) {
            axios
                .delete(`http://${ip}:3045/manipularProduto`, { data: { id: produto.id } })
                .then(() => {
                    this.filtraProdutos(this.processo, this.modelo, this.pesquisa)
                })
                .catch((error) => {
                    console.error("Erro ao apagar produto", error.response);
                });
        },

        adicionarProduto(produto) {
            let novoProduto = {
                produto: '',
                modelo: produto.modelo,
                processo: produto.processo,
                recipientes: '',
                consumo_previo: '',
                preco_kg: '',
                base: produto.base,
                usuariocreate: this.decodeJwt().usuario,
                id_modelo: produto.id_modelo,
                novoProduto: true,
            }

            this.produtos.push(novoProduto);
        },

        salvarProduto(produto) {
            axios
                .post(`http://${ip}:3045/manipularProduto`, produto)
                .then(() => {
                    this.filtraProdutos(this.processo, this.modelo, this.pesquisa)
                })
                .catch((error) => {
                    console.error("Erro ao adicionar produto", error.response);
                });
        },

        removerNovoProduto(indice) { 
            this.produtos.splice(indice, 1);
        },

        filtraProdutos(processo, modelo, pesquisa) {
            if (pesquisa && pesquisa.length < 3) {
                return this.buscaTodosProdutos(processo, modelo, pesquisa)
            }

            this.buscaTodosProdutos(processo, modelo)
        },

        buscaTodosProdutos(processo, modelo, pesquisa) {
            this.loading = true;

            axios
                .get(`http://${ip}:3045/todosProdutos`, { params: { processo: processo, modelo: modelo, pesquisa: pesquisa } })
                .then((response) => {
                    this.produtos = response.data
                    this.loading = false;
                    this.loaded = true;
                })
                .catch((error) => {
                    console.error("Erro ao buscar produtos", error.response ? error.response.status : error.message);
                });
        },

        buscaProcessosCadastrados() {
            axios
                .get(`http://${ip}:3045/buscaProcessosCadastrados`)
                .then((response) => this.processos = response.data)
                .catch((error) => console.error("Erro ao buscar modelos cadastrados", error.response))
        },

        buscaModelosCadastrados(processo) {
            axios
                .get(`http://${ip}:3045/buscaModelosCadastrados`, { params: { processo: processo } })
                .then((response) => {
                    response.data.map(item => this.modelos.push(item.modelo));
                })
                .catch((error) => {
                    console.error("Erro ao buscar modelos", error.response);
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
        },
    },

    components: {
        MiniStatisticsCard,
        Alert,
    },
}
</script>