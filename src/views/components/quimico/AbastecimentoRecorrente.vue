<template>
    <v-dialog max-width="800">
        <template v-slot:activator="{ props: activatorProps }">
            <div v-bind="activatorProps" class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
                <mini-statistics-card :title="{ text: 'Abastecimento Recorrente' }" :icon="{
                    name: 'restart_alt',
                    color: 'text-white',
                    background: 'primary',
                }" />
            </div>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-card-title class="text-center border-bottom position-sticky fixed-top border-bottom bg-white">
                    <h3>Abastecimento recorrente</h3>
                </v-card-title>
                <v-card-item>
                    <span>Em breve</span>
                </v-card-item>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="danger" text="Fechar" variant="tonal"
                        @click="isActive.value = false;"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

    <alert ref="alert" />
</template>

<script>
// import axios from "axios";
import MiniStatisticsCard from "../MiniStatisticsCard.vue"
// import ip from "../../../ip";
import VueJwtDecode from "vue-jwt-decode"
import Alert from '../Alert.vue';

export default {
    name: "abasteciento-recorrente",
    data() {
        return {
            produtos: {},
        }
    },

    mounted() {
    },

    methods: {
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