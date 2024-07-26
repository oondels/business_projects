<template>
    <div class="col-3 p-1">
        <div v-if="!inicioContagem" class="card p-2">
            <div class="col-12 row">
                <h6>{{ "Point " + indice }}</h6>
            </div>
            <v-text-field label="Código do crachá" v-model="codigoRfid" @keypress.enter="buscaColaborador"
                variant="outlined" class="mb-2"></v-text-field>
            <v-text-field v-if="!achouColaboradorCodigo" label="Matrícula" variant="outlined" class="mb-2"></v-text-field>
            <v-select v-if="achouColaborador" label="Modelo" v-model="modeloSelecionado" :items="modelos"
                @update:modelValue="buscaPartes" variant="outlined" class="mb-2"></v-select>
            <v-select v-if="achouColaborador" label="Parte" v-model="parteSelecionada" :items="partes"
                variant="outlined" class="mb-2"></v-select>
            <v-text-field v-if="achouColaborador" label="A produzir" v-model="producao" variant="outlined" class="mb-2"
                @keyup="calculaTempoProducao" @keypress.enter="salvaPrevisaoProducao"></v-text-field>
            <v-btn class="bg-success" :disabled="!producao" @click="salvaPrevisaoProducao">Iniciar</v-btn>
        </div>

        <div v-if="inicioContagem" class="card p-2">
            <div class="col-12 row mb-2">
                <h6 class="col-6">{{ "Point " + indice }}</h6>
                <span class="col-6 text-end"><strong>{{ producaoContagem }}</strong></span>
                <span class="col-6">{{ modeloContagem }}</span>
                <span class="col-6 text-end">{{ parteContagem }}</span>
            </div>
            <div class="card col-12 mb-2">
                <span class="rounded text-center text-white fs-1"
                    :class="contador.split('')[0] === '-' ? 'bg-danger' : 'bg-success'">{{ contador }}</span>
            </div>
            <v-btn @click="pararContagem" class="bg-black text-white">Parar</v-btn>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import ip from '../../ip';

export default {
    name: "card-point",

    data() {
        return {
            inicioContagem: false,
            achouColaboradorCodigo: true,
            achouColaborador: false,

            codigoRfid: 0,
            colaborador: {},
            producao: null,
            tempoProducao: 0,
            partes: [],

            modeloSelecionado: '',
            parteSelecionada: '',
            tempoParte: 0,
            dataEstimadaConclusao: null,

            producaoContagem: 0,
            modeloContagem: '',
            parteContagem: '',
            horaVencimento: '',

            contadorInterval: '',
            contador: '',
            diferencaDoTempo: 0,
        }
    },

    mounted() {
        this.buscaContagem();
    },

    props: {
        indice: Number,
        modelos: Array,
    },

    methods: {
        calculaTempoProducao() {
            if (this.parteSelecionada && this.producao) {
                this.tempoParte = Number(this.parteSelecionada.split(' - ')[1]);

                let tempoCentesimos = this.tempoParte * this.producao;
                let tempoSegundos = tempoCentesimos * 60;
                let horas = Math.floor(tempoSegundos / 3600);
                let minutos = Math.floor((tempoSegundos % 3600) / 60);
                let segundos = tempoSegundos % 60;

                this.tempoProducao = `${horas}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

                this.calculaDataHoraConclusao();
            }
        },

        calculaDataHoraConclusao() {
            let dataAtual = new Date();
            let [horas, minutos, segundos] = this.tempoProducao.split(':').map(Number);
            let tempoProducaoMilissegundos = ((horas * 3600) + (minutos * 60) + segundos) * 1000;

            this.dataEstimadaConclusao = new Date(dataAtual.getTime() + tempoProducaoMilissegundos).getTime();
        },

        salvaPrevisaoProducao() {
            this.calculaTempoProducao();

            const previsao = {
                rfidCreate: this.codigoRfid,
                nomeCreate: this.colaborador.nome,
                setorCreate: this.colaborador.nome_setor,
                matriculaCreate: this.colaborador.matricula,
                modelo: this.modeloSelecionado,
                parte: this.parteSelecionada,
                producaoIndicada: this.producao,
                tempoEstimado: this.tempoProducao,
                tempoParte: this.tempoParte,
                dataEstimadaConclusao: this.dataEstimadaConclusao,
                point: this.indice,
            };

            axios.post(`http://${ip}:3046/salvaPrevisaoProducao`, { previsao })
                .then(() => {
                    console.log("Salvou previsão");
                    this.buscaContagem();
                })
                .catch((error) => console.error("Erro ao salvar previsão: ", error));
        },

        pararContagem() {
            const parada = {
                point: this.indice,
                tempoConclusao: this.contador,
            };

            axios.post(`http://${ip}:3046/pararContagem`, { parada })
                .then(() => {
                    this.zeraInputs();
                    clearInterval(this.contadorInterval);
                    this.buscaContagem();
                })
                .catch((error) => console.error("Erro ao parar contagem: ", error));
        },

        buscaContagem() {
            axios.get(`http://${ip}:3046/buscaContagem`, { params: { point: this.indice } })
                .then((response) => {

                    if (response.status === 200) {
                        this.producaoContagem = response.data.producao_indicada;
                        this.modeloContagem = response.data.modelo;
                        this.parteContagem = response.data.parte;
                        this.dataFinal = response.data.data_estimada_conclusao;
                        this.inicioContagem = true;
                        this.iniciaContagemRegressiva();
                    } else {
                        this.inicioContagem = false;
                    }
                })
                .catch((error) => {
                    this.inicioContagem = false;
                    if (error.response && error.response.status === 404) {
                        console.warn("Nenhuma contagem encontrada.");
                    } else {
                        console.error("Erro ao iniciar contagem: ", error);
                    }
                });
        },

        iniciaContagemRegressiva() {
            if (this.dataFinal) {
                this.contadorInterval = setInterval(() => {
                    const fimDaContagem = new Date(this.dataFinal);
                    const agora = new Date();
                    this.diferencaDoTempo = fimDaContagem - agora;

                    if (this.diferencaDoTempo <= 0) {
                        clearInterval(this.contadorInterval);
                        return this.iniciaContagemProgressiva();
                    }

                    const horas = Math.floor(this.diferencaDoTempo / (1000 * 60 * 60));
                    const minutos = Math.floor((this.diferencaDoTempo % (1000 * 60 * 60)) / (1000 * 60));
                    const segundos = Math.floor((this.diferencaDoTempo % (1000 * 60)) / 1000);

                    const pad = (num) => String(num).padStart(2, '0');
                    this.contador = `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
                }, 1000);
            } else {
                clearInterval(this.contadorInterval);
            }
        },

        iniciaContagemProgressiva() {
            if (this.dataFinal) {
                this.contadorInterval = setInterval(() => {
                    const fimDaContagem = new Date(this.dataFinal);
                    const agora = new Date();
                    this.diferencaDoTempo = agora - fimDaContagem;

                    const horas = Math.floor(this.diferencaDoTempo / (1000 * 60 * 60));
                    const minutos = Math.floor((this.diferencaDoTempo % (1000 * 60 * 60)) / (1000 * 60));
                    const segundos = Math.floor((this.diferencaDoTempo % (1000 * 60)) / 1000);

                    const pad = (num) => String(num).padStart(2, '0');
                    this.contador = `-${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
                }, 1000);
            } else {
                clearInterval(this.contadorInterval);
            }
        },

        buscaColaborador() {
            axios.get(`http://${ip}:3046/buscaColaboradorPeloRfid`, { params: { codigoRfid: this.codigoRfid } })
                .then((response) => {
                    if (response.data) {
                        this.colaborador = response.data;
                        this.achouColaboradorCodigo = true;
                        this.achouColaborador = true;
                    } else {
                        this.achouColaboradorCodigo = false;
                        this.achouColaborador = false;
                    }
                })
                .catch((error) => {
                    this.achouColaboradorCodigo = false;
                    this.achouColaborador = false;
                    console.error("Erro ao buscar colaborador: ", error.message);
                });
        },

        buscaPartes() {
            axios.get(`http://${ip}:3046/buscaPartes`, { params: { modelo: this.modeloSelecionado } })
                .then((response) => {
                    this.partes = response.data[0];
                })
                .catch((error) => console.error("Erro ao buscar partes: ", error.message));
        },

        zeraInputs() {
            this.achouColaborador = false
            this.codigoRfid = 0
            this.colaborador = {}
            this.modeloSelecionado = ''
            this.parteSelecionada = ''
            this.producao = 0
            this.tempoProducao = ''
            this.tempoParte = ''
            this.dataEstimadaConclusao = ''
        }
    },
}
</script>