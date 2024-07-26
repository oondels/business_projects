<template>
    <div class="div-body d-flex justify-content-center align-items-center" :style="{
        backgroundImage: 'url(' + require('../../public/img/vr-bg.png') + ')',
        backgroundSize: 'cover',
    }">
        <form class="stepper w-50 shadow-none transform-scale-10 px-5 pt-5">
            <div class="mb-2 text-black">
                <v-text-field type="number" :rules="matriculaRules" v-model="matricula" label="Número de Matrícula"
                    ref="matriculaField" @keypress.enter="buscaColaboradorPelaMatricula(matricula)">
                </v-text-field>
                <v-text-field :disabled="!matricula" type="password" v-model="codigoRfid" ref="codigoRfidField"
                    @keypress.enter="buscaColaboradorPelaMatricula(matricula)" label="Código do crachá"></v-text-field>
                <v-text-field type="text" disabled v-model="nomeColaborador" label="Nome do Colaborador"
                    ref="nomeField">
                </v-text-field>
            </div>
            <div class="col-12 d-flex justify-content-center">
                <div class="col-6">
                    <v-btn :disabled="!matricula" @click="vincularRfidMatricula()"
                        class="col-12 mb-4 bg-success font-weight-bold text-white fs-5">Concluir</v-btn>
                </div>
            </div>
            <app-footer />
        </form>

        <v-dialog v-model="dialogShown" max-width="400">
            <v-card :color="corAlerta" dark>
                <v-card-title class="headline">
                    <i :class="iconeAlerta"></i>
                    {{ tituloAlerta }}
                </v-card-title>
                <v-card-text>
                    {{ mensagemAlerta }}
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" @click="dialogShown = false">OK</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<style>
.div-body {
    height: 89vh;
}
</style>

<script>
import AppFooter from "@/examples/Footer.vue";
// import MaterialInput from "@/components/MaterialInput.vue";
import axios from "axios";
import ip from "../ip"
import VueJwtDecode from 'vue-jwt-decode';

const body = document.getElementsByTagName("body")[0];

export default {
    name: "reserva",
    components: {
        AppFooter,
        // MaterialInput
    },

    data() {
        return {
            dialogShown: false,
            corAlerta: '',
            iconeAlerta: '',
            tituloAlerta: '',
            mensagemAlerta: '',

            codigoRfid: '',
            matricula: '',
            matriculaRules: [value => (value && value.length === 7) || 'Insira seu crachá completo'],
            nomeColaborador: '',

            model: 'Entrega',
        };
    },
    methods: {

        decodeJwt() {
            let token = sessionStorage.getItem('token');
            if (token) {
                return VueJwtDecode.decode(token);
            }
        },

        vincularRfidMatricula() {
            if (!this.decodeJwt()) {
                this.mostrarAlerta('warning', 'fas fa-exclamation', 'Aviso', 'Você não está autenticado(a) no aplicativo');
                return
            }
            axios
                .post(`http://${ip}:3048/vincularRfidMatricula`, {
                    codigoRfid: this.codigoRfid,
                    usuarioUpdate: this.decodeJwt().usuario,
                    matricula: this.matricula,
                    nome: this.nomeColaborador,
                })
                .then((response) => {
                    if (response.status === 200) {
                        this.mostrarAlerta('success', 'fas fa-thumbs-up', 'Sucesso', 'Matrícula vinculada com sucesso');
                        this.codigoRfid = ''
                        this.matricula = ''
                        this.nomeColaborador = ''
                    }
                })
                .catch(() => {
                    this.mostrarAlerta('danger', 'fas fa-thumbs-down', 'Erro', 'Você pode ter inserido o crachá incorreto');
                })
        },

        buscaColaboradorPelaMatricula(matricula) {
            axios
                .get(`http://${ip}:3048/buscaColaboradorPelaMatricula`, { params: { matricula: matricula } })
                .then(response => {
                    if (!response.data) {
                        this.mostrarAlerta('danger', 'fas fa-thumbs-down', 'Erro', 'Você pode ter inserido o crachá incorreto');
                    } else {
                        this.nomeColaborador = response.data
                    }
                })
        },

        focoNoInput(refInput) {
            this.$nextTick(() => {
                this.$refs[refInput].focus();
            });
        },

        mostrarAlerta(cor, icone, titulo, mensagem) {
            this.corAlerta = cor;
            this.iconeAlerta = icone;
            this.tituloAlerta = titulo;
            this.mensagemAlerta = mensagem;
            this.dialogShown = true;

            setTimeout(() => {
                this.dialogShown = false;
            }, "2000")
            return;
        },
    },

    beforeMount() {
        this.$store.state.showSidenav = false;
        this.$store.state.showFooter = false;
        body.classList.add("reserva");
        this.$store.state.isTransparent = "bg-white";
    },

    beforeUnmount() {
        this.$store.state.showSidenav = true;
        this.$store.state.showFooter = true;
        body.classList.remove("reserva");
        this.$store.state.isTransparent = true;
    }
};
</script>