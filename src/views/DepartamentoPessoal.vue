<template>
    <div class="col-12 row m-0 mb-6">
        <div v-bind="activatorProps" class="col-lg-6 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
            <router-link to="/departamento-pessoal/provisorio">
                <mini-statistics-card :title="{ text: 'Cadastro de provisório' }" :icon="{
                    name: 'badge',
                    color: 'text-white',
                    background: 'info',
                }" />
            </router-link>
        </div>


        <v-dialog max-width="800">
            <template v-slot:activator="{ props: activatorProps }">
                <div v-bind="activatorProps" class="col-lg-6 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
                    <mini-statistics-card :title="{ text: 'Registro de atendimento' }" :icon="{
                        name: 'support_agent',
                        color: 'text-white',
                        background: 'info',
                    }" />
                </div>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card>
                    <v-card-title class="text-center border-bottom position-sticky fixed-top border-bottom bg-white">
                        <h3>Atendimento</h3>
                    </v-card-title>
                    <v-card-item>
                        <div class="col-12 my-2">
                            <v-text-field class="text-black mb-2" v-model="rfid"
                                @keypress.enter="buscaColaborador(rfid)" density="compact" variant="outlined"
                                label="Crachá"></v-text-field>
                            <v-text-field class="text-black mb-2" v-model="colaborador.nome" disabled density="compact"
                                variant="outlined" label="Nome"></v-text-field>
                            <v-text-field class="text-black mb-2" v-model="colaborador.gerente" disabled
                                density="compact" variant="outlined" label="Gerente"></v-text-field>
                            <v-text-field class="text-black mb-2" v-model="colaborador.nome_setor" disabled
                                density="compact" variant="outlined" label="Setor"></v-text-field>
                        </div>
                    </v-card-item>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="danger" text="Fechar" variant="tonal" @click="isActive.value = false;"></v-btn>
                        <v-btn color="success" text="Atender" variant="tonal" @click="iniciaAtendimento()"></v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </div>

    <div class="col-12 row m-0 mb-6">
        <h4>Quantidade de atendimentos</h4>
        <div class="col-12 row p-0 m-0 mb-2">
            <v-select variant="solo" density="compact" class="col-4" :items="atendentes" v-model="atendente"
                @update:modelValue="setor = ''; gerente = ''; gerenciaFiltros(atendente)" label="Atendente"></v-select>
            <v-select variant="solo" density="compact" class="col-4" :items="gerentes" v-model="gerente"
                @update:modelValue="setor = ''; gerenciaFiltros(atendente, gerente)" label="Gerente"></v-select>
            <v-select :disabled="gerente ? false : true" variant="solo" density="compact" class="col-4" :items="setores" v-model="setor"
                @update:modelValue="gerenciaFiltros(atendente, gerente, setor)" label="Setor"></v-select>
        </div>
        <div class="col-12">
            <div class="rounded bg-gradient-info">
                <h5 class="text-center m-0 p-0">Atendimentos</h5>
                <reports-bar-chart v-if="mostrarAtendimentos" :id="'votos'" :chart="atendimentos" />
            </div>
        </div>
    </div>

    <alert ref="alert" />

</template>

<script>
import axios from "axios";
import MiniStatisticsCard from "./components/MiniStatisticsCard.vue"
import ip from "../ip";
import VueJwtDecode from "vue-jwt-decode"
import Alert from './components/Alert.vue';
import ReportsBarChart from "@/examples/Charts/ReportsBarChart.vue";

export default {
    name: 'departamento-pessoal',
    data() {
        return {
            activatorProps: true,
            colaborador: {},
            rfid: '',

            mostrarAtendimentos: false,
            atendimentos: {},

            atendentes: [],
            gerentes: [],
            setores: [],

            atendente: '',
            gerente: '',
            setor: '',
        }
    },
    mounted() {
        this.buscaAtendimentos()
        this.buscaFiltros()
    },
    methods: {
        gerenciaFiltros(atendente, gerente, setor) {
            this.buscaFiltros(gerente)
            this.buscaAtendimentos(atendente, gerente, setor)
        },
        buscaFiltros(gerente) {
            axios
                .get(`http://${ip}:3044/filtros`, { params: { gerenteParam: gerente } })
                .then((response) => {
                    this.gerentes = response.data.gerentes;
                    this.setores = response.data.setores;
                    this.atendentes = response.data.atendentes;
                })
                .catch((error) => {
                    console.error("Erro ao trazer filtros", error);
                });
        },

        buscaAtendimentos(atendente, gerente, setor) {

            this.mostrarAtendimentos = false;

            axios
                .get(`http://${ip}:3044/atendimento`, { params: { atentente: atendente, gerente: gerente, setor: setor } })
                .then((response) => {
                    this.atendimentos = response.data

                    this.mostrarAtendimentos = true;
                })
                .catch((error) => {
                    console.error("Erro ao trazer atendimentos", error);
                })
        },

        buscaColaborador(rfid) {
            axios
                .get(`http://${ip}:3044/colaborador`, { params: { rfid: rfid } })
                .then((response) => { this.colaborador = response.data; })
                .catch((error) => this.$refs.alert.mostrarAlerta('warning', 'fa fa-exclamation-triangle', 'Erro', error.response.data.error));
        },

        iniciaAtendimento() {
            axios
                .post(`http://${ip}:3044/atendimento`, { colaborador: this.colaborador, atendente: this.decodeJwt().usuario })
                .then((response) => {
                    this.$refs.alert.mostrarAlerta('success', 'fa fa-check', 'Sucesso', response.data);
                    this.colaborador = {};
                    this.rfid = '';
                    this.buscaAtendimentos();
                    this.buscaFiltros();
                })
                .catch((error) => {
                    this.$refs.alert.mostrarAlerta('warning', 'fa fa-exclamation-triangle', 'Erro', error.response.data.error);
                });
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
        ReportsBarChart,
    },
}

</script>