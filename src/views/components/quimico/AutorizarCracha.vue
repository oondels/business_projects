<template>
    <v-dialog max-width="900">
        <template v-slot:activator="{ props: activatorProps }">
            <div @click="buscaGerentes" v-bind="activatorProps"
                class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
                <mini-statistics-card :title="{ text: 'Autorizados' }" :icon="{
                    name: 'lock_open',
                    color: 'text-white',
                    background: 'dark',
                }" />
            </div>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-card-title class="position-sticky fixed-top border-bottom d-flex justify-content-between bg-white">
                    <h3 class="col-5">Autorizar crachá</h3>

                    <i @click="isActive.value = false"
                        class="material-icons-round cursor-pointer text-danger text-end align-content-center opacity-10 fs-1 col-1">cancel</i>
                </v-card-title>
                <v-card-item>
                    <div class="col-12">
                        <div class="col-12 row m-0 mb-1">
                            <v-text-field density="compact" class="col-6 mb-2" variant="outlined" placeholder="Matrícula"
                                v-model="colaborador.matricula"
                                @keyup="buscaColaborador(colaborador.matricula)"></v-text-field>
                            <v-text-field density="compact" disabled class="col-6 mb-2" variant="outlined" placeholder="Nome"
                                v-model="colaborador.nome"></v-text-field>
                            <v-text-field density="compact" disabled class="col-6 mb-2" variant="outlined" placeholder="Gerente"
                                v-model="colaborador.gerente"></v-text-field>
                            <v-text-field density="compact" disabled class="col-6 mb-2" variant="outlined" placeholder="Setor"
                                v-model="colaborador.setor"></v-text-field>
                        </div>
                        <v-card-actions class="mb-4 border-bottom">
                            <v-spacer></v-spacer>
                            <v-btn color="success" text="Salvar" variant="tonal"
                                @click="salvaCrachaAutorizado()"></v-btn>
                        </v-card-actions>
                        <div class="col-12 mb-4">
                            <div class="col-12 row m-0 mb-4">
                                <div class="col-8">
                                    <h6>Crachás autorizados</h6>
                                </div>
                                <div class="col-4">
                                    <v-text-field density="compact" type="number" v-model="pesquisa" @keyup="buscaCrachasAutorizados(pesquisa)" placeholder="Pesquisar Matrícula" variant="outlined"></v-text-field>
                                </div>
                            </div>
                            <div class="col-12">
                                <ul class="list-group">
                                    <li class="list-group-item" v-for="autorizado in autorizados" :key="autorizado.id">
                                        <div class="col-12 row">
                                            <div class="col-1 p-0 text-center">
                                                <span class="w-100">{{ autorizado.matricula }}</span>
                                            </div>
                                            <div class="col-4">
                                                <span class="w-100">{{ autorizado.nome }}</span>
                                            </div>
                                            <div class="col-2 p-0">
                                                <span class="w-100">
                                                    {{
                                                        autorizado.gerente.split(" ")[0]
                                                        + ' ' +
                                                        autorizado.gerente.split(" ").pop()
                                                    }}
                                                </span>
                                            </div>
                                            <div class="col-3 p-0">
                                                <span class="w-100">{{ autorizado.setor }}</span>
                                            </div>
                                            <div class="col-2 p-0 text-center">
                                                <span class="w-100">{{ autorizado.autorizante }}</span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

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
    name: 'relatorios',

    data() {
        return {

            colaborador: {
                matricula: null,
                nome: '',
                gerente: '',
                setor: '',
                autorizante: '',
            },

            autorizados: [],

            pesquisa: '',
        }
    },

    mounted() {
        this.buscaCrachasAutorizados()
    },

    methods: {
        buscaColaborador(matricula) {
            if (matricula.length === 7) {
                axios
                    .get(`http://${ip}:3045/buscaSolicitante`, { params: { matricula: matricula } })
                    .then((response) => {
                        this.colaborador.nome = response.data.nome;
                        this.colaborador.gerente = response.data.gerente;
                        this.colaborador.setor = response.data.nome_setor;
                    })
                    .catch((error) => {
                        console.error("Erro ao buscar solicitante", error.response);
                    })
            }
        },
        salvaCrachaAutorizado() {
            this.colaborador.autorizante = this.decodeJwt().usuario;
            axios
                .post(`http://${ip}:3045/cracha`, { colaborador: this.colaborador })
                .then((response) => {
                    this.$refs.alert.mostrarAlerta('success', 'fas fa-thumbs-up', 'Sucesso', response.data);
                    this.buscaCrachasAutorizados()
                })
                .catch((error) => {
                    console.error("Erro ao autorizar crachá", error.response);
                    this.$refs.alert.mostrarAlerta('warning', 'fas fa-thumbs-down', 'Erro', error.response.data);
                })

            this.colaborador = {}
        },

        buscaCrachasAutorizados(matricula) {
            axios
                .get(`http://${ip}:3045/cracha`, { params: { matricula: matricula } })
                .then((response) => {
                    this.autorizados = response.data;
                })
                .catch((error) => {
                    console.error("Erro ao buscar solicitante", error.response);
                })
        },

        decodeJwt() {
            let token = sessionStorage.getItem('token');
            if (token) {
                return VueJwtDecode.decode(token);
            }
        },
    },
    components: {
        MiniStatisticsCard,
        Alert,
    },
}
</script>