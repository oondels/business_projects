<template>
    <div class="row mt-15">
        <div class="col-xl-4 col-sm-12 mb-xl-0">
            <mini-statistics-card title="Reservas totais" :value="reservasDoDia.length"
                :consumido="reservasConsumidas.length" :icon="{
                    component: 'confirmation_number',
                    background: 'bg-gradient-dark',
                }" direction-reverse />
        </div>
        <div class="col-xl-4 col-sm-6 mb-xl-0">
            <mini-statistics-card title="Light" :value="reservasLight.length"
                :consumido="reservasLightConsumidas.length" :icon="{
                    component: 'dinner_dining',
                    background: 'bg-gradient-dark',
                }" direction-reverse />
        </div>
        <div class="col-xl-4 col-sm-6 mb-xl-0">
            <mini-statistics-card title="Lanche" :value="reservasLanche.length"
                :consumido="reservasLancheConsumidas.length" :icon="{
                    component: 'local_pizza',
                    background: 'bg-gradient-dark',
                }" direction-reverse />
        </div>
    </div>
    <!-- 
    <div class="row">
        <div class="col-12">
            <lista-reservas-do-dia :reservasDoDia="reservasDoDia" />
        </div>
    </div> -->

    <div class="row position-sticky fixed-bottom bg-white border-top">
        <v-row no-gutters class="border d-flex justify-center align-center"
            :class="!reservaEncontrada ? 'justify-between' : 'justify-center'">
            <v-col cols="12" :sm="5">
                <v-text-field type="password" class="ma-2 pa-2" :rules="codigoRfidRules" v-model="codigoRfid"
                    ref="codigoRfidField" @keypress.enter="entregaReservaPeloRfid()"
                    label="Código do crachá"></v-text-field>
            </v-col>
            OU
            <v-col class="d-flex justify-between align-center ma-2 pa-2" cols="12" sm="6">
                <v-text-field type="number" :rules="matriculaRules" v-model="matricula" label="Número de Matrícula"
                    ref="matriculaField" @keypress.enter="entregaReservaPelaMatricula()">
                </v-text-field>
            </v-col>
            <v-btn class="d-flex justify-between align-center" color="success" text="Confirmar" variant="flat"
                @click="entregaReservaPelaMatricula()"></v-btn>
        </v-row>
    </div>

    <v-dialog v-model="dialogShown" max-width="400">
        <v-card :color="corAlerta" dark>
            <v-card-title class="headline">
                <i :class="iconeAlerta"></i>
                {{ tituloAlerta }}
            </v-card-title>
            <v-card-text class="fs-1">
                {{ mensagemAlerta }}
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="dialogShown = false">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>
<script>
import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
// import ListaReservasDoDia from "./ListaReservasDoDia.vue";
import axios from "axios";
import ip from "../../ip";

const body = document.getElementsByTagName("body")[0];

export default {
    name: "consumo-refeicao",
    data() {
        return {
            codigoRfid: '',
            matricula: '',

            reservaEncontrada: true,
            matriculaRules: [value => (value && value.length === 7) || 'Insira seu crachá completo'],
            codigoRfidRules: [this.reservaEncontrada || 'Reserva não encontrada, tente com a matrícula'],

            dialogShown: false,
            corAlerta: '',
            iconeAlerta: '',
            tituloAlerta: '',
            mensagemAlerta: '',
        }
    },
    emits: ['atualizar-informacao'],
    mounted() {
        this.focoNoInput('codigoRfidField')
    },
    methods: {

        focoNoInput(refInput) {
            this.$nextTick(() => {
                this.$refs[refInput].focus();
            });
        },

        entregaReservaPeloRfid() {
            axios
                .post(`http://${ip}:3048/entregaReservaPeloRfid`, {
                    codigoRfid: this.codigoRfid,
                })
                .then((response) => {
                    this.$emit('atualizar-informacao');
                    if (response.status === 200) {
                        this.reservaEncontrada = true;
                        this.codigoRfid = '';
                        this.mostrarAlerta('success', 'fas fa-thumbs-up', 'Sucesso', `Reserva ${response.data.reserva.opcao_selecionada}`);
                    }
                })
                .catch((error) => {
                    this.$emit('atualizar-informacao');
                    if (error.response.status === 500) {
                        this.codigoRfid = '';
                        this.reservaEncontrada = false;
                        this.focoNoInput('matriculaField')
                        this.mostrarAlerta('danger', 'fas fa-thumbs-down', 'Erro', 'Contate o suporte');
                    } else if (error.response.status === 404) {
                        this.reservaEncontrada = false;
                        this.focoNoInput('matriculaField')
                    }
                })
        },

        entregaReservaPelaMatricula() {
            axios
                .post(`http://${ip}:3048/entregaReservaPelaMatricula`, {
                    matricula: this.matricula,
                })
                .then((response) => {
                    this.$emit('atualizar-informacao');
                    console.log(response.data);
                    if (response.status === 200) {
                        this.matricula = '';
                        this.codigoRfidos = '';
                        this.reservaEncontrada = true;
                        this.mostrarAlerta('success', 'fas fa-thumbs-up', 'Sucesso', `Reserva ${response.data.reserva.opcao_selecionada}`);
                    }
                })
                .catch((error) => {
                    this.$emit('atualizar-informacao');
                    if (error.response.status === 500) {
                        this.matricula = '';
                        this.codigoRfid = '';
                        this.reservaEncontrada = true;
                        this.mostrarAlerta('danger', 'fas fa-thumbs-down', 'Erro', 'Contate o suporte');
                    } else if (error.response.status === 404) {
                        this.mostrarAlerta('warning', 'fas fa-exclamation', 'Aviso', 'Não existe reserva para esta matrícula');
                        this.matricula = '';
                        this.codigoRfid = '';
                        this.reservaEncontrada = true;
                        this.focoNoInput('codigoRfidField')
                    }
                })
        },

        mostrarAlerta(cor, icone, titulo, mensagem, funcaoAdicional = '') {
            this.corAlerta = cor;
            this.iconeAlerta = icone;
            this.tituloAlerta = titulo;
            this.mensagemAlerta = mensagem;
            this.dialogShown = true;

            funcaoAdicional

            setTimeout(() => {
                this.dialogShown = false;
            }, "3000")
            return;
        },
    },

    beforeMount() {
        this.$store.state.showNavbar = true;
        this.$store.state.showSidenav = false;
        this.$store.state.showFooter = true;
        body.classList.add("consumo-refeicao");
        this.$store.state.isTransparent = "bg-white";
    },
    
    beforeUnmount() {
        this.$store.state.showSidenav = true;
        this.$store.state.showFooter = true;
        body.classList.add("consumo-refeicao");
        this.$store.state.isTransparent = true;
    },
    props: {
        reservasDoDia: Array,
        reservasLanche: Array,
        reservasLight: Array,
        reservasLancheConsumidas: Array,
        reservasLightConsumidas: Array,
        reservasConsumidas: Array,
    },
    components: {
        MiniStatisticsCard,
        // ListaReservasDoDia,
    },
}
</script>