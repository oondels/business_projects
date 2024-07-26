<template>
    <div class="container-fluid">
        <v-card class="mb-2">
            <v-card-title>
                <div class="col-12 align-content-center row m-0">
                    <h5 class="col-4 m-0 align-content-center">Filtrar informações</h5>
                    <div class="col-8 row m-0">
                        <div class="col-3">
                            <v-text-field density="compact" variant="outlined" label="Código" v-model="filtro.codigo"
                                @keypress.enter="buscaProdutos()" hide-details></v-text-field>
                        </div>
                        <div class="col-3">
                            <v-text-field density="compact" variant="outlined" label="Ordem" v-model="filtro.ordem"
                                @keypress.enter="buscaProdutos()" hide-details></v-text-field>
                        </div>
                        <div class="col-3">
                            <v-text-field type="date" density="compact" variant="outlined" label="Data de movimentação"
                                v-model="filtro.data" @update:modelValue="buscaProdutos()" hide-details></v-text-field>
                        </div>
                    </div>
                </div>
            </v-card-title>
        </v-card>

        <v-card>
            <v-card-title>
                <div class="col-12 align-content-center row m-0">
                    <h5 class="col-4 m-0 align-content-center">Manuseio de produtos</h5>
                    <div class="col-8 row m-0">
                        <div class="col-3">
                            <v-text-field density="compact" variant="outlined" label="Código" v-model="codigo"
                                hide-details></v-text-field>
                        </div>
                        <div class="col-3">
                            <v-text-field density="compact" variant="outlined" label="Ordem" v-model="ordem"
                                hide-details></v-text-field>
                        </div>
                        <div class="col-3">
                            <v-text-field density="compact" variant="outlined" label="Matrícula"
                                v-model="colaborador.matricula" hide-details
                                @keyup="buscaColaborador(colaborador.matricula)"></v-text-field>
                        </div>
                        <div class="col-3 text-end">
                            <v-btn color="primary" @click="salvarProduto">Salvar</v-btn>
                        </div>
                    </div>
                </div>
            </v-card-title>

            <v-card-text>
                <h6>Saída da montagem</h6>
                <lista-ordens :produtos="saidaMontagem" :lista="'SAIDA MONTAGEM'" />

                <h6>Dentro da expedição</h6>
                <lista-ordens :produtos="entradaExpedicao" :lista="'ENTRADA EXPEDICAO'" />

                <h6>Saída da expedição</h6>
                <lista-ordens :produtos="saidaExpedicao" :lista="'SAIDA EXPEDICAO'" />
            </v-card-text>
        </v-card>
    </div>

    <alert ref="alert" />

</template>

<script>
import axios from 'axios';
import ip from '../ip';
import ListaOrdens from './components/baixaProducao/ListaOrdens.vue';
import Alert from './components/Alert.vue';

export default {
    name: 'baixa-produto',
    data() {
        return {
            colaborador: {
                matricula: '',
                nome: '',
                setor: '',
                gerente: '',
            },
            codigo: '',
            ordem: '',

            filtro: {
                data: '',
                codigo: '',
                ordem: '',
            },

            saidaMontagem: [],
            entradaExpedicao: [],
            saidaExpedicao: [],
        }
    },
    mounted() {
        this.pegaDataAtual();
        this.buscaProdutos();
    },
    methods: {
        pegaDataAtual() {
            let data = new Date();
            let dia = data.getDate().toString().padStart(2, '0');
            let mes = (data.getMonth() + 1).toString().padStart(2, '0');
            let ano = data.getFullYear();

            this.filtro.data = `${ano}-${mes}-${dia}`
        },

        buscaColaborador(matricula) {
            if (matricula && matricula.length > 6) {
                axios
                    .get(`http://${ip}:3043/colaboradores`, { params: { matricula: matricula } })
                    .then((response) => {
                        this.colaborador.nome = response.data.nome;
                        this.colaborador.setor = response.data.nome_setor;
                        this.colaborador.gerente = response.data.gerente;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        },

        salvarProduto() {
            axios
                .post(`http://${ip}:3043/produtos`, {
                    colaborador: this.colaborador,
                    ordem: this.ordem,
                    codigo: this.codigo
                })
                .then(() => {
                    this.buscaProdutos()
                })
                .catch((error) => {
                    this.$refs.alert.mostrarAlerta('warning', 'fas fa-exclamation-triangle', 'Erro', error.response.data);
                    console.error(error);
                });
        },

        buscaProdutos() {
            axios
                .get(`http://${ip}:3043/produtos`, { params: { filtro: this.filtro } })
                .then((response) => {
                    this.saidaMontagem = response.data.saidaMontagem;
                    this.entradaExpedicao = response.data.entradaExpedicao;
                    this.saidaExpedicao = response.data.saidaExpedicao;
                })
                .catch((error) => {
                    console.error(error);
                });
        },
    },
    components: {
        ListaOrdens,
        Alert
    }
}
</script>