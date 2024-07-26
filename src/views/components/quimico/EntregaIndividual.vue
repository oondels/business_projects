<template>
    <h5>Solicitações individuais</h5>
    <div class="col-12">
        <v-expansion-panels v-if="solicitacoesIndividuais.length" class="my-4 lista" variant="popout">
            <v-expansion-panel v-for="solicitacao in solicitacoesIndividuais" :key="solicitacao.id">
                <v-expansion-panel-title class="col-12 row p-1 m-0">
                    <span class="col-lg-1 text-center text-xs rounded"
                        :class="solicitacao.abastecendo ? 'bg-success' : 'bg-warning'">
                        {{ solicitacao.abastecendo ? 'Iniciado' : 'Pendente' }}
                    </span>
                    <span class="col-lg-1">{{ solicitacao.celula }}</span>
                    <span class="col-lg-2">{{ solicitacao.produto }}</span>
                    <span class="col-lg-2">Recipientes: {{ solicitacao.recipientes }}</span>
                    <span class="col-lg-2 text-center">{{ solicitacao.usuariocreate }}</span>
                    <span class="col-lg-2 text-center">{{ solicitacao.turno }}</span>
                    <span class="col-lg-2 text-end">{{ dataFormatada(solicitacao.createdate) }}</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text v-if="permissoes" class="border-top">
                    <v-card-actions>
                        <div class="w-25 px-1">
                            <v-text-field v-if="solicitacao.abastecendo" v-model="residuo"
                                placeholder="Quantidade Resíduo"></v-text-field>
                        </div>
                        <div class="w-25 px-1">
                            <v-text-field v-if="solicitacao.abastecendo" v-model="abastecido"
                                placeholder="Quantidade Abastecida"></v-text-field>
                        </div>
                        <v-spacer></v-spacer>
                        <v-btn v-if="!solicitacao.abastecendo"
                            @click="salvaAbastecimentoIndividual(solicitacao.id, 'inicio')" color="warning"
                            variant="flat" text="Iniciar abastecimento"></v-btn>
                        <v-btn v-if="solicitacao.abastecendo"
                            @click="salvaAbastecimentoIndividual(solicitacao.id, 'fim')" color="success" variant="flat"
                            text="Fechar pedido"></v-btn>
                    </v-card-actions>
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
    name: 'entrega-individual',

    props: {
        permissoes: Boolean,
    },

    data() {
        return {
            solicitacoesIndividuais: [],
            residuo: null,
            abastecido: null,
        }
    },

    mounted() {
        this.buscaSolicitacoes();
    },

    methods: {
        salvaAbastecimentoIndividual(id, instrucao) {
            const abastecimento = {
                id: id,
                instrucao: instrucao,
                residuo: this.residuo,
                abastecido: this.abastecido,
                usuario: this.decodeJwt().usuario,
                mes: new Date().getMonth(),
            };

            axios
                .post(`http://${ip}:3045/salvaAbastecimentoIndividual`, { abastecimento })
                .then(() => {
                    if (instrucao === 'inicio') {
                        return this.buscaSolicitacoes();
                    }
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Erro ao manipular abastecimento", error.response ? error.response.status : error.message);
                });
        },

        buscaSolicitacoes() {
            axios
                .get(`http://${ip}:3045/individualSolicitado`)
                .then((response) => {
                    this.solicitacoesIndividuais = response.data
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
    max-height: 300px;
    overflow-y: auto;
}

.v-expansion-panel-title__icon {
    display: none !important;
}

.v-input__details {
    display: none !important;
}
</style>