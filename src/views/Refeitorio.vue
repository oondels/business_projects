<template>
  <div class="py-4 container-fluid">
    <div class="row mb-4">
      <div class="col-lg-12 position-relative">
        <div v-if="permissaoRefeitorio()" class="card p-0 mb-4 px-2">
          <h5 class="m-0">Controladores</h5>
          <div class="row d-flex justify-content-between col-12">
            <v-switch
              color="primary"
              class="col-8"
              v-model="reservarSabadoNaSexta"
              :label="`Reservar sábado na sexta: ${
                reservarSabadoNaSexta === true ? 'Sim' : 'Não'
              }`"
              hide-details
              inset
              @change="salvaConfiguracao()"
            >
            </v-switch>
            <div class="col-4 row">
              <v-text-field
                class="col-6 text-center"
                type="date"
                label="Data para reserva diária"
                v-model="dataAmanhaParaReserva"
                @change="salvaConfiguracao()"
              ></v-text-field>

              <v-text-field
                class="col-6 text-center"
                type="date"
                label="Data para reserva extra"
                v-model="dataReserva"
                @change="salvaConfiguracao()"
              ></v-text-field>
            </div>
          </div>
        </div>
        <h5>Reservas para o próximo dia</h5>
        <div class="row position-sticky fixed-top">
          <div class="col-xl-4 col-sm-12 mb-xl-0">
            <mini-statistics-card2
              title="Reservas totais"
              :value="reservasAmanhaDoDia.length"
              :consumido="reservasAmanhaConsumidas.length"
              :icon="{
                component: 'confirmation_number',
                background: 'bg-gradient-dark',
              }"
              direction-reverse
            />
          </div>
          <div class="col-xl-4 col-sm-6 mb-xl-0">
            <mini-statistics-card2
              title="Light"
              :value="reservasAmanhaLight.length"
              :consumido="reservasAmanhaLightConsumidas.length"
              :icon="{
                component: 'dinner_dining',
                background: 'bg-gradient-dark',
              }"
              direction-reverse
            />
          </div>
          <div class="col-xl-4 col-sm-6 mb-xl-0">
            <mini-statistics-card2
              title="Lanche"
              :value="reservasAmanhaLanche.length"
              :consumido="reservasAmanhaLancheConsumidas.length"
              :icon="{
                component: 'local_pizza',
                background: 'bg-gradient-dark',
              }"
              direction-reverse
            />
          </div>
        </div>
        <div class="col-lg-12 col-sm-12">
          <div class="card col-12 z-index-2 mb-4">
            <v-select
              label="Unidade"
              v-model="unidadeDadosGrafico"
              :items="['Santo Estêvão', 'Vitória da Conquista', 'Itaberaba']"
              @update:modelValue="buscaDadosGlobais"
            ></v-select>

            <gradient-line-chart
              v-if="showChart"
              id="performance1"
              title="Refeitório"
              :description="'Reservado x Consumido'"
              :chart="chartData"
            />
          </div>
        </div>
        <h5 class="mb-2">Ações</h5>
        <div class="row">
          <router-link
            v-if="permissaoRefeitorio()"
            to="/refeitorio/reserva"
            class="col-lg-3 col-md-6 col-sm-6 mt-lg-0 mt-4"
          >
            <mini-statistics-card
              :title="{ text: 'Reservar' }"
              :icon="{
                name: 'lunch_dining',
                color: 'text-white',
                background: 'primary',
              }"
            />
          </router-link>

          <v-dialog full>
            <template
              v-if="permissaoRefeitorio()"
              v-slot:activator="{ props: activatorProps }"
            >
              <div
                v-bind="activatorProps"
                class="col-lg-3 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer"
              >
                <mini-statistics-card
                  :title="{ text: 'Reservados' }"
                  :icon="{
                    name: 'format_list_bulleted',
                    color: 'text-white',
                    background: 'dark',
                  }"
                />
              </div>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card class="z-4">
                <v-card-title
                  class="position-fixed fixed-top border-bottom d-flex justify-content-between bg-white"
                >
                  <h3>Reservas do Dia</h3>
                  <i
                    @click="isActive.value = false"
                    class="material-icons-round cursor-pointer text-danger text-end align-content-center opacity-10 fs-1 col-1"
                    >cancel</i
                  >
                </v-card-title>

                <consumo-refeicao
                  :reservasDoDia="reservasDoDia"
                  :reservasLanche="reservasLanche"
                  :reservasLight="reservasLight"
                  :reservasLancheConsumidas="reservasLancheConsumidas"
                  :reservasLightConsumidas="reservasLightConsumidas"
                  :reservasConsumidas="reservasConsumidas"
                  @atualizar-informacao="atualizarInformacao"
                />

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="danger"
                    text="Fechar"
                    variant="text"
                    @click="isActive.value = false"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>

          <v-dialog max-width="800">
            <template
              v-if="autorizaReservarSexta()"
              v-slot:activator="{ props: activatorProps }"
            >
              <div
                v-bind="activatorProps"
                class="col-lg-3 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer"
              >
                <mini-statistics-card
                  :title="{ text: 'Sábado/Feriado' }"
                  :icon="{
                    name: 'restaurant',
                    color: 'text-white',
                    background: 'success',
                  }"
                />
              </div>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title
                  class="text-center border-bottom position-sticky fixed-top border-bottom bg-white"
                >
                  <h3>Reserva do sábado / Feriado</h3>
                  <div class="col-12 insercao-informacao">
                    <div class="col-12 row">
                      <v-select
                        class="col-6"
                        v-model="gerenteSelecionado"
                        @update:modelValue="buscaSetores(gerenteSelecionado)"
                        label="Gerente do colaborador"
                        :items="gerentes"
                        autofocus
                      ></v-select>
                      <v-select
                        class="col-6"
                        :disabled="disabledSetores"
                        label="Setor do colaborador"
                        :items="setores"
                        v-model="setorSelecionado"
                        @update:modelValue="buscaColaboradoresPorSetor"
                      ></v-select>
                    </div>

                    <div class="col-12 row">
                      <v-select
                        :disabled="disabledCelula"
                        class="col-6"
                        :items="gerentes"
                        label="Gerente da hora extra"
                        v-model="gerenteDestino"
                        @update:modelValue="buscaSetores(gerenteDestino)"
                      ></v-select>
                      <v-select
                        class="col-6"
                        :disabled="disabledCelula"
                        label="Setor da hora extra"
                        :items="setores"
                        v-model="setorDestino"
                      ></v-select>
                    </div>

                    <div class="col-12 row">
                      <v-text-field
                        disabled
                        class="col-6"
                        type="date"
                        label="Data da Reserva"
                        v-model="dataReserva"
                      ></v-text-field>
                      <v-text-field
                        :disabled="disabledCelula"
                        class="col-6"
                        type="time"
                        label="Hora da reserva"
                        v-model="horaReserva"
                      ></v-text-field>
                    </div>
                  </div>
                </v-card-title>
                <v-card-item>
                  <listagem-colaborador
                    v-if="!disabledCelula"
                    ref="listagemColaborador"
                    :colaboradoresSabado="colaboradoresSabado"
                    :dataReserva="dataReserva"
                    :horaReserva="horaReserva"
                    :gerenteSelecionado="gerenteSelecionado"
                    :gerenteDestino="gerenteDestino"
                    :setorSelecionado="setorSelecionado"
                    :setorDestino="setorDestino"
                    @atualizar-informacao="atualizarInformacao"
                  />
                </v-card-item>

                <v-card-actions
                  class="position-fixed fixed-bottom bg-white border-top"
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    color="danger"
                    text="Fechar"
                    variant="flat"
                    @click="isActive.value = false"
                  ></v-btn>
                  <v-btn
                    color="success"
                    text="Salvar"
                    @click="emitirSalvarColaboradores"
                    variant="flat"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>

          <v-dialog max-width="800">
            <template
              v-if="permissaoRefeitorio()"
              v-slot:activator="{ props: activatorProps }"
            >
              <div
                @click="buscaGerentes"
                v-bind="activatorProps"
                class="col-lg-3 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer"
              >
                <mini-statistics-card
                  :title="{ text: 'Relatórios' }"
                  :icon="{
                    name: 'receipt_long',
                    color: 'text-white',
                    background: 'info',
                  }"
                />
              </div>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title>
                  <h3>Relatórios de reservas</h3>
                  <div class="col-12 row">
                    <div class="col-6 text-center mb-3">
                      <v-btn @click="triagemRelatorio('Lanche')"
                        >Reservas diárias</v-btn
                      >
                    </div>
                    <div class="col-6 text-center mb-3">
                      <v-btn @click="triagemRelatorio('Sábado')"
                        >Reserva do sábado</v-btn
                      >
                    </div>
                    <div class="col-6 text-center">
                      <v-btn @click="triagemRelatorio('QuantidadeSabado')"
                        >Quantidade para o sábado</v-btn
                      >
                    </div>
                    <div class="col-6 text-center">
                      <v-btn @click="triagemRelatorio('Voucher')"
                        >Voucher para o sábado</v-btn
                      >
                    </div>
                  </div>
                </v-card-title>
                <v-card-item>
                  <div v-if="gerarRelatorio">
                    <div inline>
                      <h4>Relatório do {{ tipoRelatorio }}</h4>
                    </div>
                    <div class="col-12 row">
                      <div class="col-4">
                        <v-text-field
                          type="date"
                          label="Data inicial"
                          v-model="dataInicial"
                        ></v-text-field>
                      </div>
                      <div class="col-4">
                        <v-text-field
                          type="date"
                          label="Data final"
                          v-model="dataFinal"
                        ></v-text-field>
                      </div>
                      <div class="col-4">
                        <v-select
                          :items="['Todos', 'Turno A', 'Turno B']"
                          label="Turno de reserva"
                          v-model="turnoSelecionado"
                        ></v-select>
                      </div>
                    </div>

                    <v-card-actions class="bg-white border-top">
                      <v-spacer></v-spacer>
                      <v-btn
                        color="danger"
                        text="Fechar"
                        variant="flat"
                        @click="isActive.value = false"
                      ></v-btn>
                      <v-btn
                        color="success"
                        text="Baixar"
                        @click="geraRelatorioLancheSabado(tipoRelatorio)"
                        variant="flat"
                      ></v-btn>
                    </v-card-actions>
                  </div>

                  <div
                    v-if="gerarQuantidadeSabado"
                    class="col-12 insercao-informacao"
                  >
                    <h4>Quantidade para sábado</h4>

                    <v-text-field
                      disabled
                      class="col-4"
                      type="date"
                      label="Data"
                      v-model="dataReserva"
                    ></v-text-field>

                    <v-card-actions class="bg-white border-top">
                      <v-spacer></v-spacer>
                      <v-btn
                        color="danger"
                        text="Fechar"
                        variant="flat"
                        @click="isActive.value = false"
                      ></v-btn>
                      <v-btn
                        color="success"
                        text="Baixar"
                        @click="geraRelatorioQuantidadeSabado(dataReserva)"
                        variant="flat"
                      ></v-btn>
                    </v-card-actions>
                  </div>

                  <div
                    v-if="gerarVoucherSabado"
                    class="col-12 insercao-informacao"
                  >
                    <h4>Voucher para o sábado</h4>
                    <v-select
                      class="col-6"
                      :items="gerenteReservado"
                      label="Gerentes reservados"
                      v-model="gerenteReservadoSelecionado"
                    ></v-select>

                    <v-text-field
                      disabled
                      class="col-4"
                      type="date"
                      label="Data"
                      v-model="dataReserva"
                    ></v-text-field>

                    <v-card-actions class="bg-white border-top">
                      <v-spacer></v-spacer>
                      <v-btn
                        color="danger"
                        text="Fechar"
                        variant="flat"
                        @click="isActive.value = false"
                      ></v-btn>
                      <v-btn
                        color="success"
                        text="Baixar"
                        @click="
                          geraVoucherPeloGerente(gerenteReservadoSelecionado)
                        "
                        variant="flat"
                      ></v-btn>
                    </v-card-actions>
                  </div>
                </v-card-item>
              </v-card>
            </template>
          </v-dialog>
        </div>

        <!-- Lista de Reservas -->
        <div
          v-if="permissaoRefeitorio() && reservasAmanhaDoDia.length > 0"
          class="reservas mt-3"
        >
          <h5>Reservas</h5>
          <div class="reserva-list">
            <v-text-field
              v-model="pesquisaReserva"
              label="Pesquisar matrícula"
              @update:modelValue="filtroReservas"
            ></v-text-field>

            <table class="tabela-reservas">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Matrícula</th>
                  <th>Opção</th>
                  <th>Data da Reserva</th>
                  <th>Gerente</th>
                  <th>Cancelar</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(reserva, reservaIndex) in reservasFiltradas"
                  :key="reservaIndex"
                >
                  <td>{{ reserva.nome }}</td>
                  <td>{{ reserva.matricula }}</td>
                  <td>{{ reserva.opcao_selecionada }}</td>
                  <td>{{ formatarData(reserva.data_reserva) }}</td>
                  <td>{{ reserva.gerente }}</td>
                  <td>
                    <div class="text-center">
                      <v-dialog max-width="400" persistent>
                        <template v-slot:activator="{ props: activatorProps }">
                          <v-btn v-bind="activatorProps"> Cancelar </v-btn>
                        </template>

                        <template v-slot:default="{ isActive }">
                          <v-card
                            color="danger"
                            dark
                            prepend-icon="mdi mdi-alert"
                            text="Esse proceso não pode ser revertido, será necessário chamar o colaborador para agendar novamente. 
                          Só cancele se tiver certeza!"
                            title="Deseja cancelar esta reserva?"
                          >
                            <template v-slot:actions>
                              <v-spacer></v-spacer>

                              <v-btn
                                @click="isActive.value = false"
                                color="yellow-accent-1"
                                variant="outlined"
                                dark
                              >
                                Não Cancelar Reserva
                              </v-btn>

                              <v-btn
                                @click="
                                  isActive.value = false;
                                  canclearReserva(reserva.id);
                                "
                                color="black"
                                variant="outlined"
                                dark
                                class="mr-2"
                              >
                                Cancelar Reserva
                              </v-btn>
                            </template>
                          </v-card>
                        </template>
                      </v-dialog>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <alert ref="alert" />
</template>

<script>
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import logo from "../../public/img/logo-marca-dagua.png";
import ConsumoRefeicao from "./components/ConsumoRefeicao.vue";
import ListagemColaborador from "./components/ListagemColaborador.vue";
import MiniStatisticsCard from "./components/MiniStatisticsCard.vue";

import MiniStatisticsCard2 from "@/examples/Cards/MiniStatisticsCard.vue";
import VueJwtDecode from "vue-jwt-decode";

import axios from "axios";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import ip from "../ip";
import alert from "./components/Alert.vue";

export default {
  name: "ferramentas-lean",
  components: {
    GradientLineChart,
    MiniStatisticsCard,
    MiniStatisticsCard2,
    ConsumoRefeicao,
    ListagemColaborador,
    alert,
  },
  data() {
    return {
      dadosGrafico: [],
      showChart: false,
      chartData: {},

      unidadeDadosGrafico: "Santo Estêvão",

      reservasDoDia: [],
      reservasLanche: [],
      reservasLight: [],
      reservasLancheConsumidas: [],
      reservasLightConsumidas: [],
      reservasConsumidas: [],

      reservasAmanhaDoDia: [],
      reservasAmanhaLanche: [],
      reservasAmanhaLight: [],
      reservasAmanhaLancheConsumidas: [],
      reservasAmanhaLightConsumidas: [],
      reservasAmanhaConsumidas: [],

      pesquisaReserva: "",
      reservasFiltradas: [],
      mostrarBotaoCancelar: null,

      confirmarCancelamento: false,

      reservarSabadoNaSexta: false,
      dataAmanhaParaReserva: "",

      turnoSelecionado: "Todos",
      gerenteSelecionado: null,
      gerenteDestino: null,
      dataReserva: null,
      horaReserva: null,
      setorSelecionado: null,
      setorDestino: null,
      disabledSetores: true,
      disabledCelula: true,
      celula: null,
      gerentes: [],
      setores: [],
      colaboradoresSabado: [],

      gerenteReservado: [],
      gerenteReservadoSelecionado: "",
      gerarVoucherSabado: false,
      gerarRelatorio: false,
      gerarQuantidadeSabado: false,
      dataInicial: "",
      dataFinal: "",
      tipoRelatorio: "",
    };
  },

  mounted() {
    this.pegaProximoSabado();
    this.pegaProximoDiaUtil();
    this.buscaDadosGlobais();
    this.buscaReservasDoDia();
    this.buscaReservasAmanhaDoDia();
    this.buscaGerentes();
    this.buscaGerenteReservadoSabado();
    this.buscaConfiguracao();
  },

  methods: {
    atualizarInformacao() {
      this.buscaDadosGlobais();
      this.buscaReservasDoDia();
      this.buscaReservasAmanhaDoDia();
      this.buscaColaboradoresPorSetor();
      this.buscaGerenteReservadoSabado();
      this.resetReservaSabado();
    },

    emitirSalvarColaboradores() {
      this.$refs.listagemColaborador.salvarColaboradoresSelecionados();
    },

    filtroReservas() {
      this.reservasFiltradas = this.reservasAmanhaDoDia.filter((reserva) =>
        reserva.matricula.includes(this.pesquisaReserva)
      );
    },

    canclearReserva(id) {
      axios
        .delete(`http://${ip}:3048/delete-reserva`, { data: { id: id } })
        .then(() => {
          this.$refs.alert.mostrarAlerta(
            "success",
            "done_outline",
            "Sucesso",
            "Reserva cancelada."
          );

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        })
        .catch((error) => {
          console.error("Erro ao cancelar reserva: ", error);
          this.$refs.alert.mostrarAlerta(
            "danger",
            "report",
            "Erro!",
            "Erro ao cancelar reserva."
          );
        });
    },

    formatarData(data) {
      const date = new Date(data);
      return date.toLocaleDateString("pt-BR");
    },

    triagemRelatorio(caminho) {
      if (caminho === "Lanche" || caminho === "Sábado") {
        this.tipoRelatorio = caminho;
        this.gerarRelatorio = true;
        this.gerarVoucherSabado = false;
        this.gerarQuantidadeSabado = false;
      } else if (caminho === "Voucher") {
        this.gerarRelatorio = false;
        this.gerarQuantidadeSabado = false;
        this.gerarVoucherSabado = true;
      } else {
        this.gerarQuantidadeSabado = true;
        this.gerarRelatorio = false;
        this.gerarVoucherSabado = false;
      }
    },

    autorizaReservarSexta() {
      const hoje = new Date();
      const diaDaSemana = hoje.getDay();

      if (diaDaSemana === 5) {
        if (this.reservarSabadoNaSexta) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },

    pegaProximoSabado() {
      let dataReserva = new Date();
      const dayOfWeek = dataReserva.getDay();
      const oneDay = 24 * 60 * 60 * 1000;

      if (dayOfWeek !== 6) {
        dataReserva.setTime(dataReserva.getTime() + (6 - dayOfWeek) * oneDay);
      }

      const year = dataReserva.getFullYear();
      const month = String(dataReserva.getMonth() + 1).padStart(2, "0");
      const day = String(dataReserva.getDate()).padStart(2, "0");

      this.dataReserva = `${year}-${month}-${day}`;
    },

    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    permissaoRefeitorio() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (
        this.decodeJwt().setor === "AUTOMACAO" ||
        this.decodeJwt().setor === "PORTARIA" ||
        this.decodeJwt().setor === "REFEITORIO" ||
        this.decodeJwt().setor === "ADMINISTRATIVO"
      ) {
        return true;
      }
    },

    pegaProximoDiaUtil(date = new Date()) {
      const day = date.getDay();
      let nextBusinessDay = new Date(date);

      if (day === 6) {
        nextBusinessDay.setDate(date.getDate() + 2);
      } else if (day === 0) {
        nextBusinessDay.setDate(date.getDate() + 1);
      } else {
        nextBusinessDay.setDate(date.getDate() + 1);
        if (nextBusinessDay.getDay() === 6) {
          nextBusinessDay.setDate(nextBusinessDay.getDate() + 2);
        } else if (nextBusinessDay.getDay() === 0) {
          nextBusinessDay.setDate(nextBusinessDay.getDate() + 1);
        }
      }

      const yyyy = nextBusinessDay.getFullYear();
      const mm = String(nextBusinessDay.getMonth() + 1).padStart(2, "0");
      const dd = String(nextBusinessDay.getDate()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    },

    buscaConfiguracao() {
      axios
        .get(`http://${ip}:3048/buscaConfiguracao`)
        .then((response) => {
          this.dataAmanhaParaReserva =
            this.pegaProximoDiaUtil() > response.data.dataamanha.split("T")[0]
              ? this.pegaProximoDiaUtil()
              : response.data.dataamanha.split("T")[0];
          this.reservarSabadoNaSexta = response.data.permissao;
        })
        .catch((error) => {
          console.error("Erro interno do servidor: ", error);
        });
    },

    salvaConfiguracao() {
      axios
        .post(`http://${ip}:3048/salvaConfiguracao`, {
          reservarSabadoNaSexta: this.reservarSabadoNaSexta,
          dataAmanhaParaReserva: this.dataAmanhaParaReserva,
          dataReservaExtra: this.dataReserva,
          usuarioCreate: this.decodeJwt().usuario,
        })
        .then(() => {
          this.buscaConfiguracao();
        })
        .catch((error) => {
          console.error("Erro interno do servidor: ", error);
        });
    },

    buscaReservasDoDia() {
      if (this.decodeJwt()) {
        axios
          .get(`http://${ip}:3048/buscaReservasDoDia`, {
            params: {
              unidade: this.decodeJwt().unidade,
            },
          })
          .then((response) => {
            this.reservasDoDia = response.data.totais;
            this.reservasLanche = response.data.lanche;
            this.reservasLight = response.data.light;
            this.reservasLancheConsumidas = response.data.lancheConsumidas;
            this.reservasLightConsumidas = response.data.lightConsumidas;
            this.reservasConsumidas = response.data.consumidas;
          });
      }
    },

    buscaReservasAmanhaDoDia() {
      if (this.decodeJwt()) {
        axios
          .get(`http://${ip}:3048/buscaReservasAmanhaDoDia`, {
            params: {
              unidade: this.decodeJwt().unidade,
            },
          })
          .then((response) => {
            this.reservasAmanhaDoDia = response.data.totais;
            this.reservasFiltradas - response.data.totais;
            this.filtroReservas();

            this.reservasAmanhaLanche = response.data.lanche;
            this.reservasAmanhaLight = response.data.light;
            this.reservasAmanhaLancheConsumidas =
              response.data.lancheConsumidas;
            this.reservasAmanhaLightConsumidas = response.data.lightConsumidas;
            this.reservasAmanhaConsumidas = response.data.consumidas;
          });
      }
    },

    buscaDadosGlobais() {
      let unidadeMap = {
        "Santo Estêvão": "SEST",
        "Vitória da Conquista": "VDC",
        Itaberaba: "ITB",
      };

      let unidade = unidadeMap[this.unidadeDadosGrafico] || "SEST";

      if (this.decodeJwt()) {
        this.unidadeDadosGrafico = this.decodeJwt().unidade;
        unidade = this.decodeJwt().unidade;
      }

      this.showChart = false;
      axios
        .get(`http://${ip}:3048/buscaDadoGlobaisAuditorias`, {
          params: {
            unidade: unidade,
          },
        })
        .then((response) => {
          this.dadosGrafico = response.data;

          this.processChartData();
          this.showChart = true;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados do gráfico: ", error);
        });
    },

    processChartData() {
      this.chartData = {
        labels: [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ],
        datasets: [
          {
            label: "Reservado",
            data: Array(12).fill(),
          },
          {
            label: "Consumido",
            data: Array(12).fill(),
          },
        ],
      };

      this.dadosGrafico.forEach((dado) => {
        const monthIndex = parseInt(dado.mes) - 1;
        const reservado = parseInt(dado.total_reservado);
        const consumido = parseInt(dado.total_consumido);

        this.chartData.datasets[0].data[monthIndex] = reservado;
        this.chartData.datasets[1].data[monthIndex] = consumido;
      });
    },

    buscaGerentes() {
      if (this.decodeJwt()) {
        axios
          .get(`http://${ip}:3048/buscaNomesGerentes`, {
            params: {
              unidade: this.decodeJwt().unidade,
            },
          })
          .then((response) => {
            this.gerentes = response.data;
          })
          .catch((error) => {
            console.error("Erro ao buscar os gerentes: ", error);
          });
      }
    },

    buscaSetores(gerente) {
      if (this.decodeJwt()) {
        if (gerente) {
          axios
            .get(`http://${ip}:3048/buscaSetores`, {
              params: {
                gerente: gerente,
                unidade: this.decodeJwt().unidade,
              },
            })
            .then((response) => {
              this.setores = response.data;
              this.disabledSetores = false;
            })
            .catch((error) => {
              console.error("Erro ao trazer os nomes dos setores: ", error);
            });
        }
      }
    },

    buscaColaboradoresPorSetor() {
      if (this.decodeJwt()) {
        if (this.gerenteSelecionado && this.setores && this.dataReserva) {
          axios
            .get(`http://${ip}:3048/buscaColaboradoresPorSetor`, {
              params: {
                gerente: this.gerenteSelecionado,
                setor: this.setorSelecionado,
                dataReserva: this.dataReserva,
                unidade: this.decodeJwt().unidade,
              },
            })
            .then((response) => {
              this.colaboradoresSabado = response.data;
              this.disabledCelula = false;
            })
            .catch((error) => {
              console.error("Erro ao buscar colaboradores: ", error);
            });
        }
      }
    },

    resetReservaSabado() {
      this.gerenteDestino = null;
      this.horaReserva = null;
      this.setorDestino = null;
    },

    buscaGerenteReservadoSabado() {
      if (this.decodeJwt()) {
        axios
          .get(`http://${ip}:3048/buscaGerenteReservadoSabado`, {
            params: {
              unidade: this.decodeJwt().unidade,
            },
          })
          .then((response) => {
            this.gerenteReservado = response.data;
          });
      }
    },

    geraVoucherPeloGerente(gerente) {
      if (this.decodeJwt()) {
        axios
          .get(`http://${ip}:3048/geraVoucherPeloGerente`, {
            params: {
              gerente: gerente,
              dataReserva: this.dataReserva,
              unidade: this.decodeJwt().unidade,
            },
          })
          .then((response) => {
            const pessoas = response.data;

            const doc = new jsPDF();

            const cardWidth = 68;
            const cardHeight = 24;
            const marginX = 1;
            const marginY = 1;

            let pageIndex = 0;

            pessoas.forEach((pessoa, index) => {
              const xPos =
                marginX + (pageIndex % 3) * (cardWidth + marginX * 2);
              const yPos =
                marginY +
                Math.floor(pageIndex / 3) * (cardHeight + marginY * 2);

              this.addCard(doc, pessoa, xPos, yPos, cardWidth, cardHeight);

              if ((pageIndex + 1) % 33 === 0 && index !== pessoas.length - 1) {
                doc.addPage();
                pageIndex = 0;
              } else {
                pageIndex++;
              }
            });

            try {
              doc.save(`${gerente}, ${this.dataReserva}.pdf`);
            } catch (error) {
              console.error("Erro ao salvar o PDF:", error);
            }
          })
          .catch((error) =>
            console.error("Erro ao buscar informações: ", error)
          );
      }
    },

    addCard(doc, pessoa, xPos, yPos, width, height) {
      doc.setFont("roboto", "normal");
      doc.setFontSize(6.5);

      doc.rect(xPos, yPos, width, height);

      const imgWidth = 20;
      const imgHeight = 5;
      const imgX = xPos + (width - imgWidth) / 2;
      const imgY = yPos + (height - imgHeight) / 2;
      const imgData = logo.split(",")[1];

      doc.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

      const lineHeight = 3;

      doc.text(
        `Colaborador: ${
          pessoa.nome.split(" ")[0] + " " + pessoa.nome.split(" ").pop()
        }`,
        xPos + 1,
        yPos + 2
      );
      doc.text(
        `Gerente: ${
          pessoa.gerente.split(" ")[0] + " " + pessoa.gerente.split(" ").pop()
        }`,
        xPos + 1,
        yPos + 2 + lineHeight
      );
      doc.text(
        `Matrícula: ${pessoa.matricula}`,
        xPos + 1,
        yPos + 1 + lineHeight * 2
      );
      doc.text(
        `Data da Reserva: ${new Date(pessoa.dataReserva).toLocaleDateString()}`,
        xPos + 1,
        yPos + 1 + lineHeight * 3
      );
      doc.text(
        `Hora da Reserva: ${pessoa.horaReserva}`,
        xPos + 1,
        yPos + 1 + lineHeight * 4
      );
      doc.text(
        `Usuário Criador: ${pessoa.usuarioCreate}`,
        xPos + 1,
        yPos + 1 + lineHeight * 5
      );
      doc.text(
        `Gerente de Destino: ${
          pessoa.gerenteDestino.split(" ")[0] +
          " " +
          pessoa.gerenteDestino.split(" ").pop()
        }`,
        xPos + 1,
        yPos + 1 + lineHeight * 6
      );
      doc.text(
        `Setor de Destino: ${pessoa.setorDestino}`,
        xPos + 1,
        yPos + 1 + lineHeight * 7
      );
    },

    geraRelatorioLancheSabado(tipoRelatorio) {
      if (this.decodeJwt()) {
        axios
          .get(`http://${ip}:3048/geraRelatorioLancheSabado`, {
            params: {
              tipoRelatorio: tipoRelatorio,
              dataInicial: this.dataInicial,
              dataFinal: this.dataFinal,
              turno: this.turnoSelecionado,
              unidade: this.decodeJwt().unidade,
            },
          })
          .then((response) => {
            this.gerarXlsx(
              response.data,
              tipoRelatorio,
              this.dataInicial,
              this.dataFinal,
              this.turnoSelecionado
            );
          })
          .catch((error) => {
            console.error("Erro ao buscar dados de relatório: ", error);
          });
      }
    },

    gerarXlsx(dados, tipoRelatorio, dataInicial, dataFinal, turno) {
      let dadosFormatados = [];

      if (tipoRelatorio === "Lanche") {
        dadosFormatados = dados.map((item) => ({
          ID: item.id,
          Matrícula: item.matricula,
          Nome: item.nome,
          Gerente: item.gerente,
          Setor: item.setor,
          OçãoSelecionada: item.opcao_selecionada,
          DataCriação: new Date(item.createdate).toLocaleString(),
          DataReserva: new Date(item.data_reserva).toLocaleString(),
          Consumido: item.consumido === true ? "Consumido" : "Não consumido",
        }));
      } else if (tipoRelatorio === "Sábado") {
        dados.map((item) => {
          item.colaboradores.map((item2) => {
            dadosFormatados.push({
              Matricula: item2.matricula,
              Nome: item2.nome,
              GerenteOrigem: item2.gerente,
              GerenteDestino: item.gerente_destino,
              SetorDestino: item.setor_destino,
              HoraReserva: item.hora_reserva,
              UsuarioCriação: item.usuariocreate,
              DataCriação: new Date(item.createdate).toLocaleString(),
              DataConsumo: new Date(item.data_reserva).toLocaleString(),
            });
          });
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        `Relatório ${tipoRelatorio}`
      );

      const xlsxBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([xlsxBuffer], { type: "application/octet-stream" });
      saveAs(
        blob,
        `Relatorio ${tipoRelatorio}:${turno}, ${dataInicial}-${dataFinal}.xlsx`
      );
    },

    geraRelatorioQuantidadeSabado(dataReserva) {
      if (this.decodeJwt()) {
        axios
          .get(`http://${ip}:3048/geraRelatorioQuantidadeSabado`, {
            params: {
              dataReserva: dataReserva,
              unidade: this.decodeJwt().unidade,
            },
          })
          .then((response) => {
            this.gerarXlsxQuantidadeSabado(response.data, dataReserva);
          })
          .catch((error) => {
            console.error("Erro ao buscar dados de relatório: ", error);
          });
      }
    },
    gerarXlsxQuantidadeSabado(dados, dataReserva) {
      let dadosFormatados = [];

      dadosFormatados = dados.map((item) => ({
        DataReserva: item.data_reserva,
        HoraReserva: item.hora_reserva,
        quantidade_hora: item.quantidade_hora,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        `Relatório ${dataReserva}`
      );

      const xlsxBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([xlsxBuffer], { type: "application/octet-stream" });
      saveAs(blob, `Relatorio ${dataReserva}.xlsx`);
    },
  },
};
</script>

<style>
.tabela-reservas {
  border-collapse: collapse;
  width: 100%;
}

.tabela-reservas td,
.tabela-reservas th {
  border: 1px solid #ddd;
  padding: 10px;
}

.tabela-reservas tr:nth-child(even) {
  background-color: #f2f2f2;
}

.tabela-reservas tr:hover {
  background-color: #ddd;
  cursor: pointer;
}

.tabela-reservas th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #04aa6d;
  color: white;
}

.tabela-reservas button {
  background-color: rgb(217, 83, 79);
  border-radius: 10px;
  color: #fff;
}

.tabela-reservas button:hover {
  background-color: rgb(241, 124, 120);
}
</style>
