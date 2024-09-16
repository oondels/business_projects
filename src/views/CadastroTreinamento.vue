<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <h4 class="text-center">Cadastro de Treinamentos</h4>

    <div class="container-cadastro">
      <div class="cadastro-treinamento">
        <div style="min-width: 430px" class="colaborador p-2">
          <h6>Cadastro Colaborador</h6>
          <v-text-field
            v-model="dadosColaborador.matricula"
            type="number"
            @keyup="getEmployee(dadosColaborador.matricula)"
            label="Matrícula"
          ></v-text-field>

          <v-text-field
            v-model="dadosColaborador.nome"
            label="Nome"
            disabled
          ></v-text-field>

          <v-text-field
            v-model="dadosColaborador.setor"
            label="Setor"
            disabled
          ></v-text-field>

          <v-text-field
            v-model="dadosColaborador.treinamento"
            label="Treinamento"
          ></v-text-field>

          <v-combobox
            label="Setor do Treinamento"
            :items="setores"
            v-model="setorTreinamento"
          ></v-combobox>
        </div>

        <div style="min-width: 430px" class="dados-gerente p-2">
          <h6>Dados Gerente da Célula</h6>
          <v-text-field
            type="number"
            label="Célula"
            v-model="dadosColaborador.celula"
          ></v-text-field>

          <v-combobox
            :items="['Fábrica 1', 'Fábrica 2', 'Fábrica 3']"
            label="Fábrica"
            v-model="dadosColaborador.fabrica"
          ></v-combobox>

          <v-combobox
            v-model="gerenteSelecionado"
            :items="gerentes"
            item-title="nome"
            item-value="matricula"
            label="Nome Gerente"
            clearable
          ></v-combobox>

          <v-text-field
            v-model="dadosColaborador.data"
            type="date"
            label="Data"
          ></v-text-field>
        </div>
      </div>

      <div class="row p-2 col-12">
        <v-btn @click="postTraining" color="success">Cadastrar</v-btn>
      </div>
    </div>

    <div
      class="d-flex flex-column justify-content-center align-items-center show-available-trainings"
    >
      <div class="report row col-6 mt-4">
        <h5 class="text-center">Relatórios e Filtro</h5>
        <v-combobox
          variant="outlined"
          color="success"
          :items="setores"
          v-model="setorFiltro"
          label="Setor"
          class="mt-5 mb-2"
          @update:modelValue="trainingsFilter"
          clearable
        ></v-combobox>

        <div class="d-flex flex-column align-items-center">
          <div class="dates d-flex flex-row">
            <div class="d-flex flex-column align-items-center">
              <h6>Data Inicial</h6>
              <v-text-field
                v-model="relatorio.startDate"
                variant="outlined"
                type="date"
              ></v-text-field>
            </div>

            <div class="ml-4 d-flex flex-column align-items-center">
              <h6>Data Final</h6>
              <v-text-field
                v-model="relatorio.endDate"
                variant="outlined"
                type="date"
              ></v-text-field>
            </div>
          </div>
          <v-btn
            @click="getReportData"
            class="mt-2"
            variant="tonal"
            color="success"
            >Gerar Relatório
          </v-btn>
        </div>
      </div>

      <h4 class="text-center">Treinamentos Pendentes</h4>
      <div v-if="trainings">
        <div>
          <table class="tabela">
            <thead>
              <tr>
                <th class="col-1">Ação</th>
                <th>Colaborador</th>
                <th>Treinamento</th>
                <th>Data</th>
                <th>Célula</th>
                <th class="col-status">Status</th>
                <th class="col-1"></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="training in trainingsFiltered"
                :key="training.id"
                :class="{
                  late:
                    setDataStatus(training.data_treinamento) === 'late' &&
                    !training.cancelado &&
                    !training.iniciado,
                  'in-time':
                    setDataStatus(training.data_treinamento) === 'in-time' &&
                    !training.cancelado,
                  today:
                    setDataStatus(training.data_treinamento) === 'today' &&
                    !training.cancelado,
                }"
              >
                <!-- :class="'training-' + training.id" -->
                <td
                  class="col-1"
                  v-if="!training.cancelado && !training.iniciado"
                >
                  <i
                    @click="startTraining(training.id)"
                    role="button"
                    class="play-button material-symbols-outlined"
                  >
                    play_arrow
                  </i>
                </td>

                <td v-else-if="!training.cancelado && training.iniciado">
                  <v-dialog v-model="stop" max-width="400" persistent>
                    <template v-slot:activator="{ props: activatorProps }">
                      <i
                        v-bind="activatorProps"
                        role="button"
                        class="stop-button material-symbols-outlined"
                      >
                        stop_circle
                      </i>
                    </template>

                    <v-card>
                      <v-card-title>
                        <strong>Avalie o Operador </strong>
                      </v-card-title>

                      <v-card-text>
                        <v-textarea
                          v-model="resultEmployee.obs"
                          label="Descrição"
                        ></v-textarea>
                        <v-checkbox
                          :label="
                            resultEmployee.result ? 'Aprovado' : 'Reprovado'
                          "
                          :color="resultEmployee.result ? 'success' : 'danger'"
                          v-model="resultEmployee.result"
                        ></v-checkbox>
                      </v-card-text>

                      <template v-slot:actions>
                        <v-spacer></v-spacer>

                        <v-btn
                          @click="stop = false"
                          color="danger"
                          variant="outlined"
                          >Fechar
                        </v-btn>

                        <v-btn
                          variant="outlined"
                          color="success"
                          @click="(stop = false), stopTraining(training.id)"
                        >
                          Finalizar Treinamento
                        </v-btn>
                      </template>
                    </v-card>
                  </v-dialog>
                </td>

                <td v-else-if="training.cancelado">
                  <i class="material-symbols-outlined"> block </i>
                </td>

                <td v-else></td>
                <td class="col-2">{{ formateName(training.nome) }}</td>
                <td class="col-3">{{ training.treinamento }}</td>
                <td>{{ formatteDate(training.data_treinamento) }}</td>
                <td>{{ training.celula }}</td>
                <td class="col-status" v-if="training.iniciado">
                  Em andamento
                </td>
                <td class="col-status" v-else-if="training.cancelado">
                  Cancelado
                </td>
                <td class="col-status" v-else>Não iniciado</td>

                <td v-if="!training.cancelado && !training.iniciado">
                  <CaixaConfirmacao
                    :motivo="true"
                    @agreeEmit="cancelTraining($event, training.id)"
                  />
                </td>
                <td v-else></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-5 completed-trainings">
      <h4 class="text-center">Treinamentos Concluídos</h4>
      <div v-if="finishedTrainings">
        <div>
          <table class="tabela tabela-result">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Treinamento</th>
                <th>Data</th>
                <th>Instrutor</th>
                <th>Tempo</th>
                <th class="col-2">Resultado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="training in finishedTrainingsFiltered"
                :key="training.id"
                :class="'training-' + training.id"
                @mouseover="hoverDelete = training.id"
                @mouseleave="hoverDelete = null"
              >
                <td>{{ formateName(training.nome) }}</td>
                <td>{{ training.treinamento }}</td>
                <td>{{ formatteDate(training.data_treinamento) }}</td>
                <td>{{ training.start_treinamento_nome }}</td>
                <td>
                  {{ getTrainingTime(training.date_inicio, training.date_fim) }}
                </td>
                <td
                  :class="[
                    'text-center col-2',
                    training.aprovado ? 'approved' : 'disapproved',
                  ]"
                >
                  <i class="material-symbols-outlined">
                    {{ training.aprovado ? "done_outline" : "close" }}
                  </i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import { saveAs } from "file-saver";
import VueJwtDecode from "vue-jwt-decode";
import * as XLSX from "xlsx";
import CaixaConfirmacao from "../components/CaixaConfirmação.vue";
import ip from "../ip";
import alert from "./components/Alert.vue";

export default {
  name: "CadastroTreinamentoPcp",
  components: { alert, CaixaConfirmacao },

  data() {
    return {
      gerentes: [],
      gerenteSelecionado: null,
      dadosColaborador: {
        matricula: null,
        nome: "",
        setor: "",
        treinamento: "",
        data: null,
        celula: null,
        fabrica: "",
      },

      trainingsFiltered: [],
      trainings: [],
      finishedTrainingsFiltered: [],
      finishedTrainings: [],

      setorTreinamento: "",

      setores: ["PCP", "MELHORIA CONTÍNUA", "MANUTENCAO"],
      setorFiltro: "",

      instrutor: "",
      relatorio: {
        startDate: null,
        endDate: null,
      },

      hoverDelete: null,

      stop: false,
      resultEmployee: {
        obs: "",
        result: null,
      },
    };
  },

  mounted() {
    this.getAllManagers();
    this.getAllTrainings();
    this.trainingsFilter();
  },

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    setDataStatus(date) {
      const trainingDate = new Date(date);
      const currentDate = new Date();

      if (
        trainingDate.getMonth() < currentDate.getMonth() ||
        trainingDate.getDate() < currentDate.getDate()
      ) {
        return "late";
      }
      if (
        trainingDate.getMonth() === currentDate.getMonth() &&
        trainingDate.getDate() === currentDate.getDate()
      ) {
        return "today";
      }
      return "in-time";
    },

    formatteDate(dateFormate) {
      const date = new Date(dateFormate);
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }

      const options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      return date.toLocaleString("pt-BR", options);
    },

    formateName(fullName) {
      const names = fullName.split(" ");
      const firstName = names[0];
      const lastName = names[names.length - 1];
      return `${firstName} ${lastName}`;
    },

    getTrainingTime(start, end) {
      // Converte os timestamps para objetos Date
      const startDate = new Date(start);
      const endDate = new Date(end);

      // Calcula a diferença em milissegundos
      const diffMs = endDate - startDate;

      // Converte a diferença para segundos, minutos e horas
      const diffSeconds = Math.floor((diffMs / 1000) % 60);
      const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

      // Formata o resultado para horas, minutos e segundos
      const formattedTime = `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;

      return formattedTime;
    },

    verifyDate(date) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const [day, month, year] = date.split("/");
      const formattedDate = `${year}-${month}-${day}`;
      const data = new Date(formattedDate);

      if (data < currentDate) {
        return false;
      }
      return true;
    },

    checkAuth() {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }
    },

    postTraining() {
      if (
        !this.dadosColaborador.nome ||
        !this.dadosColaborador.matricula ||
        !this.dadosColaborador.setor ||
        !this.dadosColaborador.treinamento ||
        !this.dadosColaborador.data ||
        !this.dadosColaborador.fabrica ||
        !this.dadosColaborador.celula ||
        !this.setorTreinamento ||
        !this.gerenteSelecionado
      ) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Todos os campos são obrigatórios."
        );
      }

      if (!this.verifyDate(this.dadosColaborador.data)) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Insira uma data válida."
        );
      }

      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }

      axios
        .post(`http://${ip}:3020/postTraining`, {
          data: this.dadosColaborador,
          gerente: this.gerenteSelecionado,
          setorTreinamento: this.setorTreinamento,
          usuario: this.decodeJwt().usuario,
          unidade: "sest",
        })
        .then((response) => {
          (this.gerenteSelecionado = null),
            (this.dadosColaborador = {
              matricula: null,
              nome: "",
              setor: "",
              treinamento: "",
              data: null,
              celula: null,
              fabrica: "",
            });
          this.setorTreinamento = "";
          this.$refs.alert.mostrarAlerta(
            "success",
            "done_outline",
            "Sucesso",
            response.data
          );

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "warning",
            "Atenção",
            error.response.data
          );
        });
    },

    trainingsFilter() {
      if (this.setorFiltro) {
        this.trainingsFiltered = this.trainings.filter((setor) => {
          return setor.treinamento_setor.includes(this.setorFiltro);
        });

        this.finishedTrainingsFiltered = this.finishedTrainings.filter(
          (setor) => {
            return setor.treinamento_setor.includes(this.setorFiltro);
          }
        );
      } else {
        this.trainingsFiltered = this.trainings;
        this.finishedTrainingsFiltered = this.finishedTrainings;
      }
    },

    getAllTrainings() {
      axios
        .get(`http://${ip}:3020/get-all-trainings`, {
          params: {
            setor: this.setorFiltro,
            unidadeDass: "sest",
          },
        })
        .then((response) => {
          this.trainings = response.data.trainings;
          this.finishedTrainings = response.data.finished;
          this.trainingsFilter();
        })
        .catch((error) => {
          console.error("Erro ao buscar treinamentos: ", error);
        });
    },

    getAllManagers() {
      axios
        .get(`http://${ip}:3020/getAllManagers`, {
          params: {
            unidade: "sest",
          },
        })
        .then((response) => {
          this.gerentes = response.data;
        })
        .catch((error) => {
          console.error("Erro ao consultar gerentes: ", error);
        });
    },

    getEmployee(matricula) {
      if (matricula.length === 7) {
        axios
          .get(`http://${ip}:3020/getEmployee`, {
            params: {
              employee: this.dadosColaborador.matricula,
              unidade: "sest",
            },
          })
          .then((response) => {
            this.dadosColaborador.nome = response.data.nome;
            this.dadosColaborador.setor = response.data.nome_setor;
          })
          .catch((error) => {
            this.$refs.alert.mostrarAlerta(
              "warning",
              "warning",
              "Atenção",
              error.response.data
            );
          });
      }
    },

    startTraining(id) {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }

      axios
        .put(`http://${ip}:3020/start-training/${id}`, {
          user: this.decodeJwt().usuario,
          unidade: "sest",
        })
        .then((response) => {
          this.$refs.alert.mostrarAlerta(
            "success",
            "done_outline",
            "Sucesso",
            response.data
          );

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "warning",
            "Atenção",
            error.response.data
          );
        });
    },

    stopTraining(id) {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }

      axios
        .put(`http://${ip}:3020/stop-training/${id}`, {
          data: this.resultEmployee,
          user: this.decodeJwt().usuario,
          unidade: "sest",
        })
        .then((response) => {
          this.$refs.alert.mostrarAlerta(
            "success",
            "done_outline",
            "Sucesso",
            response.data
          );

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "warning",
            "Atenção",
            error.response.data
          );
        });
    },

    cancelTraining(data, id) {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }

      if (!data.motivo) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa justificar o cancelamento."
        );
      }

      axios
        .put(`http://${ip}:3020/cancel-training/${id}`, {
          motivo: data.motivo,
          user: this.decodeJwt().usuario,
          unidade: "sest",
        })
        .then((response) => {
          this.$refs.alert.mostrarAlerta(
            "success",
            "done_outline",
            "Sucesso",
            response.data
          );

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "warning",
            "Atenção",
            error.response.data
          );
        });
    },

    getReportData() {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }

      if (!this.relatorio.endDate || !this.relatorio.startDate) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Selecione um Intervalo de Datas para Gerar o Relatório"
        );
      }

      axios
        .get(`http://${ip}:3020/get-report-data`, {
          params: {
            date: {
              start: this.relatorio.startDate,
              end: this.relatorio.endDate,
            },
            setor: this.setorFiltro,
            instrutor: this.instrutor,
          },
        })
        .then((response) => {
          this.makeReport(response.data);
        })
        .catch((error) => {
          console.error("Erro ao Gerar Relatório: ", error);
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "warning",
            "Atenção",
            error.response.data
          );
        });
    },

    makeReport(data) {
      let jsonData = [];

      data.forEach((training) => {
        jsonData.push({
          Colaborador: training.nome,
          Treinamento: training.treinamento,
          "Data Treinamento": this.formatteDate(training.data_treinamento),
          "Tempo Treinamento": this.getTrainingTime(
            training.date_inicio,
            training.date_fim
          ),
          Resultado: training.aprovado ? "Aprovado" : "Reprovado",
          Instrutor: training.start_treinamento_nome,
          Setor: training.treinamento_setor,
          Celula: training.celula,
          "Gerente da Célula": training.gerente_celula,
        });
      });

      const workBook = XLSX.utils.book_new();
      const workSheet = XLSX.utils.json_to_sheet(jsonData);

      XLSX.utils.book_append_sheet(
        workBook,
        workSheet,
        "Relatório Treinamentos"
      );
      const xlsxBuffer = XLSX.write(workBook, {
        bookType: "xlsx",
        type: "array",
      });

      const currentDate = new Date();

      saveAs(
        new Blob([xlsxBuffer], {
          type: "application/octet-stream",
        }),
        `relatorio-treinamentos-${this.formatteDate(currentDate)}.xlsx`
      );
    },
  },
};
</script>

<style>
.cadastro-treinamento {
  display: flex;
  justify-content: center;
}

.container-cadastro {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  margin: 10px;
  font-size: 15px;
  text-align: left;
  table-layout: fixed;
}

.tabela th,
.tabela td {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tabela .col-1 {
  width: 70px;
}

.tabela i {
  font-size: 25px;
  transition: all ease 0.5s;
}

.tabela .play-button {
  font-variation-settings:
    "FILL" 1,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
  color: #4caf50;
}

.play-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.play-button:hover::before {
  animation: wave 1s ease-out infinite;
  opacity: 1;
}

.report {
  border: 1px solid #4caf50;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 5px 10px 0px;
  border-radius: 20px;
  padding: 20px;
  width: 73%;
  margin: 30px 0;
}

@keyframes wave {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}

.tabela .stop-button {
  color: red;
}

tr.late {
  background-color: #f8d7da !important;
}

tr.today {
  background-color: #fff3cd !important;
}

.tabela .play-button:hover,
.tabela .stop-button:hover {
  transform: scale(1.2);
}

.tabela thead tr {
  background-color: #4caf50;
  color: #ffffff;
  text-align: left;
}

.tabela th {
  padding: 10px 10px;
}

.tabela tbody tr {
  border-bottom: 1px solid #dddddd;
}

.tabela td {
  padding: 12px 15px;
}

.tabela tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.tabela tbody tr:hover {
  background-color: #ffffff;
}

.tabela td.approved {
  color: #4caf50;
}

.tabela td.disapproved {
  color: red;
}

@media screen and (max-width: 700px) {
  .cadastro-treinamento {
    display: flex;
    flex-direction: column;
  }

  .tabela tbody {
    font-size: 13px !important;
  }

  .tabela .col-status {
    display: none;
  }

  .tabela i {
    font-size: 22px;
  }

  .tabela .col-1 {
    width: 60px;
  }

  .tabela-result td:nth-last-child(1),
  .tabela-result th:nth-last-child(1) {
    display: none;
  }
}
</style>
