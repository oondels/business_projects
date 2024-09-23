<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <h4 class="text-center">Cadastro de Treinamentos</h4>

    <div class="container-cadastro">
      <div class="cadastro-treinamento">
        <div style="min-width: 430px" class="colaborador p-2">
          <h6>Cadastro Colaborador(es)</h6>

          <v-combobox
            v-model="gerenteSelecionadoColaborador"
            @update:modelValue="buscaSetores(gerenteSelecionadoColaborador)"
            :items="gerentes"
            item-title="nome"
            item-value="matricula"
            label="Gerente do Colaborador"
          ></v-combobox>

          <v-combobox
            :items="setoresGerenteColaborador"
            label="Setor do Colaborador"
            v-model="setorGerente"
            @update:modelValue="searchEmloyeeByDepartment(setorGerente)"
          ></v-combobox>

          <!-- Listagem de Colaboradores -->
          <v-dialog v-if="setorGerente" max-width="800">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                color="surface-variant"
                text="Selecionar Colaboradores"
                variant="flat"
              ></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Colaboradores">
                <v-card-text>
                  <table>
                    <thead>
                      <tr>
                        <th>Selecionar</th>
                        <th>Nome</th>
                        <th>Função</th>
                        <th>Gerente</th>
                        <th>Setor</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="colaborador in employeesByDepartment"
                        :key="colaborador.nome"
                      >
                        <td>
                          <input
                            @click="selectEmployee(colaborador)"
                            v-model="colaborador.select"
                            type="checkbox"
                          />
                        </td>
                        <td>{{ colaborador.nome }}</td>
                        <td>{{ colaborador.funcao }}</td>
                        <td>{{ colaborador.gerente }}</td>
                        <td>{{ colaborador.nome_setor }}</td>
                      </tr>
                    </tbody>
                  </table>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn text="Salvar" @click="isActive.value = false"></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>

          <div class="colaboradores-treinamento"></div>

          <v-text-field
            v-model="dadosTreinamento.nome"
            label="Treinamento"
          ></v-text-field>

          <v-combobox
            label="Setor do Treinamento"
            :items="setores"
            v-model="dadosTreinamento.setor"
          ></v-combobox>
        </div>

        <div style="min-width: 430px" class="dados-gerente p-2">
          <h6>Dados Gerente da Célula</h6>
          <v-text-field
            type="number"
            label="Célula"
            v-model="dadosTreinamento.celula"
          ></v-text-field>

          <v-combobox
            :items="['Fábrica 1', 'Fábrica 2', 'Fábrica 3']"
            label="Fábrica"
            v-model="dadosTreinamento.fabrica"
          ></v-combobox>

          <v-combobox
            v-model="gerenteSelecionado"
            :items="gerentes"
            label="Nome Gerente"
            clearable
          ></v-combobox>

          <v-text-field
            v-model="dadosTreinamento.data"
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
                <td
                  class="col-1"
                  v-if="!training.cancelado && !training.iniciado"
                >
                  <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                      <i
                        v-bind="activatorProps"
                        role="button"
                        class="play-button material-symbols-outlined"
                      >
                        play_arrow
                      </i>
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-card>
                        <v-card-title>
                          <strong>Bipe o Crachá</strong>
                        </v-card-title>

                        <v-card-text>
                          <div class="employees-check">
                            <ul>
                              <li
                                v-for="(employee, employeeId) in formateNames(
                                  training
                                )"
                                :key="employeeId"
                                :class="
                                  employeesCheckedBarcode.includes(employee)
                                    ? 'checkedBarcode'
                                    : 'notChecked'
                                "
                              >
                                <span class="employee-name">{{
                                  employee
                                }}</span>
                                <span class="status-icon">
                                  <i
                                    v-if="
                                      employeesCheckedBarcode.includes(employee)
                                    "
                                    class="material-icons"
                                  >
                                    check_circle
                                  </i>
                                  <i v-else class="material-icons"> cancel </i>
                                </span>
                              </li>
                            </ul>
                          </div>

                          <v-text-field
                            v-model="barCode"
                            @update:modelValue="checkBarCode(barCode)"
                            label="Código do crachá"
                          ></v-text-field>
                        </v-card-text>

                        <template v-slot:actions>
                          <v-spacer></v-spacer>

                          <v-btn
                            @click="isActive.value = false"
                            color="danger"
                            variant="outlined"
                            >Fechar
                          </v-btn>

                          <v-btn
                            @click="
                              startTraining(
                                training.ids,
                                formateNames(training)
                              ),
                                (isActive.value = false)
                            "
                            variant="outlined"
                            color="success"
                          >
                            Iniciar Treinamento
                          </v-btn>
                        </template>
                      </v-card>
                    </template>
                  </v-dialog>
                </td>

                <td v-else-if="!training.cancelado && training.iniciado">
                  <v-dialog v-model="stop" max-width="400" persistent>
                    <template v-slot:activator="{ props: activatorProps }">
                      <span v-if="!training.pausado">
                        <i
                          v-bind="activatorProps"
                          role="button"
                          class="stop-button material-symbols-outlined"
                          @click="setResultObject(training)"
                        >
                          stop_circle
                        </i>

                        <i
                          role="button"
                          @click="pauseTraining(training, 'pause')"
                          class="material-symbols-outlined"
                        >
                          pause_circle
                        </i>
                      </span>

                      <i
                        v-if="training.pausado"
                        role="button"
                        class="material-symbols-outlined"
                        @click="pauseTraining(training, 'play')"
                      >
                        play_pause
                      </i>
                    </template>

                    <v-card>
                      <v-card-title>
                        <strong>Avalie o Operador </strong>
                      </v-card-title>

                      <v-card-text>
                        <div
                          v-for="(employee, employeeId) in formateNames(
                            training
                          )"
                          :key="employeeId"
                        >
                          <v-text-field
                            :label="employee"
                            v-model="avaliacaoColaborador[employee].obs"
                          ></v-text-field>

                          <v-checkbox
                            :label="
                              avaliacaoColaborador[employee].result
                                ? 'Aprovado'
                                : 'Reprovado'
                            "
                            :color="
                              avaliacaoColaborador[employee].result
                                ? 'success'
                                : 'danger'
                            "
                            v-model="avaliacaoColaborador[employee].result"
                          ></v-checkbox>
                        </div>
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
                          @click="(stop = false), stopTraining()"
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
                <td class="col-2">
                  {{ formateNames(training.nomes_colaboradores, "format") }}
                </td>
                <td class="col-3">{{ training.treinamento }}</td>
                <td>{{ formatteDate(training.data_treinamento) }}</td>
                <td>{{ training.celula }}</td>
                <td class="col-status" v-if="training.pausado">Pausado</td>
                <td class="col-status" v-else-if="training.iniciado">
                  Pausado
                </td>
                <td class="col-status" v-else-if="training.cancelado">
                  Cancelado
                </td>
                <td class="col-status" v-else>Não iniciado</td>

                <td v-if="!training.cancelado && !training.iniciado">
                  <CaixaConfirmacao
                    :motivo="true"
                    @agreeEmit="cancelTraining($event, training.ids)"
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
                <!-- <th class="col-2">Resultado</th> -->
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
                <td>
                  {{ formateNames(training.nomes_colaboradores, "format") }}
                </td>
                <td>{{ training.treinamento }}</td>
                <td>{{ formatteDate(training.data_treinamento) }}</td>
                <td>{{ training.start_treinamento_nome }}</td>
                <td>
                  {{ getTrainingTime(training.date_inicio, training.date_fim) }}
                </td>
                <!-- <td
                  :class="[
                    'text-center col-2',
                    training.aprovado ? 'approved' : 'disapproved',
                  ]"
                >
                  <i class="material-symbols-outlined">
                    {{ training.aprovado ? "done_outline" : "close" }}
                  </i>
                </td> -->
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
      gerenteSelecionadoColaborador: "",
      setoresGerenteColaborador: [],
      setorGerente: "",
      employeesByDepartment: {},
      dadosTreinamento: {
        nome: "",
        setor: "",
        data: null,
        celula: null,
        fabrica: "",
      },

      dadosColaboradores: [],

      trainingsFiltered: [],
      trainings: [],
      finishedTrainingsFiltered: [],
      finishedTrainings: [],

      barCode: null,
      employeesCheckedBarcode: [],

      avaliacaoColaborador: {},
      resultColaborador: {},

      setores: ["PCP", "MELHORIA CONTÍNUA", "MANUTENCAO"],
      setorFiltro: "",

      instrutor: "",
      relatorio: {
        startDate: null,
        endDate: null,
      },

      hoverDelete: null,

      stop: false,
    };
  },

  mounted() {
    this.getAllManagers();
    this.getAllTrainings();
    this.getAllFinishedTrainings();
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

    formateNames(names, command) {
      if (command === "format") {
        let newNames = "";

        names
          .split(",")
          .map((name) => name.trim())
          .forEach((name) => {
            const nameSplited = name.split(" ");
            const firstName = nameSplited[0];
            const lastName = nameSplited[nameSplited.length - 1];

            const newName = `${firstName} ${lastName}`;
            newNames += `${newName} | `;
          });
        return newNames;
      }

      let newNames = [];

      names.nomes_colaboradores
        .split(",")
        .map((name) => name.trim())
        .forEach((name) => {
          newNames.push(name);
        });
      return newNames;
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
      // if (
      //   !this.dadosTreinamento.nome ||
      //   !this.dadosTreinamento.setor ||
      //   !this.dadosTreinamento.data ||
      //   !this.dadosTreinamento.fabrica ||
      //   !this.dadosTreinamento.celula ||
      //   !this.setorTreinamento ||
      //   !this.gerenteSelecionado ||
      //   !this.dadosColaboradores
      // ) {
      //   return this.$refs.alert.mostrarAlerta(
      //     "warning",
      //     "warning",
      //     "Atenção",
      //     "Todos os campos são obrigatórios."
      //   );
      // }

      if (!this.verifyDate(this.dadosTreinamento.data)) {
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
          colaboradores: this.dadosColaboradores,
          treinamento: this.dadosTreinamento,
          gerente: this.gerenteSelecionado,
          usuario: this.decodeJwt().usuario,
          unidade: "sest",
        })
        .then((response) => {
          (this.gerenteSelecionado = null),
            (this.gerenteSelecionadoColaborador = ""),
            (this.setoresGerenteColaborador = []),
            (this.setorGerente = ""),
            (this.employeesByDepartment = {}),
            (this.dadosTreinamento = {
              nome: "",
              setor: "",
              data: null,
              celula: null,
              fabrica: "",
            }),
            (this.dadosColaboradores = []);
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
          console.log(this.trainings);
          this.finishedTrainings = response.data.finished;
          this.trainingsFilter();
        })
        .catch((error) => {
          console.error("Erro ao buscar treinamentos: ", error);
        });
    },

    getAllFinishedTrainings() {
      axios
        .get(`http://${ip}:3020/get-all-finished-trainings`, {
          params: {
            unidadeDass: "sest",
          },
        })
        .then((response) => {
          this.finishedTrainings = response.data.trainings;
          console.log(this.finishedTrainings);
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

    buscaSetores(gerente) {
      if (gerente) {
        axios
          .get(`http://${ip}:3020/buscaSetores/${gerente}`)
          .then((response) => {
            this.setoresGerenteColaborador = response.data;
          })
          .catch((error) => {
            console.error("Erro ao trazer os nomes dos setores: ", error);
          });
      }
    },

    searchEmloyeeByDepartment(department) {
      if (department) {
        axios
          .get(`http://${ip}:3020/get-emplpoyee-by-department/${department}`)
          .then((response) => {
            this.employeesByDepartment = response.data;
            console.log(this.employeesByDepartment);
          })
          .catch((error) => {
            console.error(
              "Erro ao buscar os operadores do setor selecionado: ",
              error
            );
          });
      }
    },

    selectEmployee(employee) {
      const index = this.dadosColaboradores.findIndex(
        (item) => item.matricula === employee.matricula
      );
      if (index !== -1) {
        return this.dadosColaboradores.splice(index, 1);
      }

      this.dadosColaboradores.push(employee);
    },

    checkBarCode(barCode) {
      if (barCode.length === 14) {
        axios
          .get(`http://${ip}:3020/check-barcode/${barCode}`)
          .then((response) => {
            this.employeesCheckedBarcode.push(response.data[0].nome);
            this.barCode = "";
          })
          .catch((error) => {
            console.error("Erro interno no servidor: ", error);
          });
      }
    },

    async startTraining(id, employees) {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }

      const absent = [];
      employees.forEach((nome) => {
        if (!this.employeesCheckedBarcode.includes(nome)) {
          absent.push(nome);
        }
      });

      if (this.employeesCheckedBarcode.length === 0) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Só é possivel iniciar o treinamento com colaborador presente."
        );
      }

      const delay = async () => {
        return new Promise((resolve) => setTimeout(resolve, 3000));
      };

      if (absent.length > 0) {
        const nomesFaltaram = absent.join(", ");
        this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          `Colaboradores Ausentes: ${nomesFaltaram}`
        );
      }

      await delay();

      axios
        .put(`http://${ip}:3020/start-training/${id}`, {
          user: this.decodeJwt().usuario,
          unidade: "sest",
          absent: absent,
        })
        .then((response) => {
          console.log(response.data);
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

    pauseTraining(training, order) {
      let api = "";

      if (order === "pause") {
        api = "pause-training";
      } else {
        api = "unpause-training";
      }

      axios
        .put(`http://${ip}:3020/${api}`, {
          data: training,
          user: this.decodeJwt().usuario,
          unidade: "sest",
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Erro ao pausar treinamento: ", error);
        });
    },

    stopTraining() {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login para prosseguir."
        );
      }

      axios
        .put(`http://${ip}:3020/stop-training`, {
          data: this.avaliacaoColaborador,
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

    setResultObject(data) {
      const nomes = data.nomes_colaboradores
        .split(",")
        .map((nome) => nome.trim());

      const employeesIds = data.ids.split(",").map((id) => id.trim());

      nomes.forEach((nome, index) => {
        this.avaliacaoColaborador[nome] = {
          result: false,
          obs: "",
          id: employeesIds[index],
        };
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
        .put(`http://${ip}:3020/cancel-training`, {
          motivo: data.motivo,
          id: id,
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
          console.error("Falha ao cancelar treinamento: ", error);
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

.employees-check ul {
  list-style-type: none;
  padding: 0;
}

.employees-check ul li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.checkedBarcode {
  background-color: #d4edda;
  color: #155724;
}

.notChecked {
  background-color: #f8d7da;
  color: #721c24;
}

.employee-name {
  font-size: 1em;
}

.status-icon {
  display: flex;
  align-items: center;
}

.material-icons {
  font-size: 24px;
}

.checkedBarcode .material-icons {
  color: #28a745;
}

.notChecked .material-icons {
  color: #dc3545;
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
