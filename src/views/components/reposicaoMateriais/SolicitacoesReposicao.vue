<template>
  <div>
    <div class="solicitacoes">
      <h4 class="text-center">Solicitações Realizadas</h4>

      <div
        class="table-container d-flex flex-column justify-content-center align-items-center"
      >
        <table>
          <thead>
            <tr>
              <th class="small-col">Status</th>
              <th>Modelo</th>
              <th>Solicitante</th>
              <th class="small-col">Célula</th>
              <th>Ordem</th>
              <th>Pedido</th>
              <th class="small-col text-center" v-if="authActions()">Ação</th>
              <th class="small-col" v-else></th>
            </tr>
          </thead>

          <tbody v-if="!loading">
            <tr
              v-for="solicitation in solicitations"
              :key="solicitation.id"
              :class="solicitationStatus(solicitation)"
            >
              <td>
                <v-tooltip
                  :text="solicitationStatus(solicitation, 'status').status"
                >
                  <template v-slot:activator="{ props }">
                    <i
                      v-bind="props"
                      role="button"
                      :class="[
                        'material-icons',
                        solicitationStatus(solicitation),
                      ]"
                    >
                      {{ solicitationStatus(solicitation, "status").icon }}
                    </i>
                  </template>
                </v-tooltip>
              </td>
              <td>{{ solicitation.modelo }}</td>
              <td>{{ solicitation.solicitante }}</td>
              <td>{{ solicitation.celula }}</td>
              <td>{{ solicitation.ordem }}</td>
              <td>{{ solicitation.pedido }}</td>
              <td
                class="small-col text-center"
                v-if="authActions() && !solicitation.finalizado"
              >
                <v-dialog max-width="700">
                  <template v-slot:activator="{ props: activatorProps }">
                    <i
                      @click="teste"
                      v-bind="activatorProps"
                      role="button"
                      class="material-icons text-center"
                    >
                      open_in_new
                    </i>
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-card
                      :title="
                        'Solicitação de peças para ' + solicitation.modelo
                      "
                    >
                      <v-card-text>
                        <div class="title-reposicao">
                          <h5 class="text-center">
                            Requisição feita por
                            <strong>{{ solicitation.solicitante }}</strong>
                          </h5>
                        </div>

                        <div
                          :class="[
                            'status text-center ordem-pedido mb-2',
                            solicitationStatus(solicitation),
                          ]"
                        >
                          Status da Solicitação:
                          <strong>
                            {{
                              solicitationStatus(solicitation, "status").status
                            }}
                          </strong>

                          <i class="material-symbols-outlined">
                            {{
                              solicitationStatus(solicitation, "status").icon
                            }}
                          </i>
                        </div>

                        <div class="ordem-pedido">
                          <span>
                            Ordem: <strong>{{ solicitation.ordem }}</strong>
                          </span>
                          <span>
                            Pedido: <strong>{{ solicitation.pedido }}</strong>
                          </span>
                        </div>

                        <div class="reposition-info">
                          <div class="info-column right">
                            <div class="info-item">
                              <strong>Data Solicitação: </strong>
                              <span>
                                {{
                                  formatteDate(solicitation.data_solicitacao)
                                }}
                              </span>
                            </div>

                            <div class="info-item">
                              <strong>Data Embarque: </strong>
                              <span>
                                {{ formatteDate(solicitation.data_embarque) }}
                              </span>
                            </div>

                            <div class="info-item">
                              <strong>Célula: </strong>
                              <span>{{ solicitation.celula }}</span>
                            </div>
                          </div>

                          <div class="info-column">
                            <div class="info-item">
                              <strong>Motivo: </strong>
                              <span>{{ solicitation.motivo }}</span>
                            </div>
                            <div class="info-item">
                              <v-dialog max-width="600">
                                <template
                                  v-slot:activator="{ props: activatorProps }"
                                >
                                  <button v-bind="activatorProps">
                                    Ver Peças
                                  </button>
                                </template>

                                <template v-slot:default="{ isActive }">
                                  <v-card title="Peças Solicitadas">
                                    <v-card-text>
                                      <div class="lista-pecas">
                                        <ul>
                                          <li
                                            v-for="peca in solicitation.pecas"
                                            :key="peca.id"
                                          >
                                            {{ peca.nome }} -
                                            <span class="peca-info">
                                              Quantidade:
                                              {{ peca.quantidade }} | Tamanho:
                                              {{ peca.tamanho }}
                                            </span>
                                          </li>
                                        </ul>
                                      </div>
                                    </v-card-text>

                                    <v-card-actions>
                                      <v-spacer></v-spacer>

                                      <v-btn
                                        text="Fechar"
                                        @click="isActive.value = false"
                                      ></v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </template>
                              </v-dialog>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5
                            class="text-center"
                            v-if="
                              solicitation.aprovacao_inspetor_qualidade ||
                              solicitation.aprovacao_gerente_industrial ||
                              solicitation.aprovacao_gerente ||
                              solicitation.aprovacao_gerente_marca
                            "
                          >
                            Solicitações Aprovadas
                          </h5>
                          <h5 class="text-center" v-else>
                            Sem Solicitações Aprovadas
                          </h5>

                          <div class="approved-list">
                            <span
                              v-if="solicitation.aprovacao_gerente_industrial"
                            >
                              Gerente Industrial:
                              <i class="material-symbols-outlined">
                                task_alt
                              </i>
                            </span>
                            <span v-if="solicitation.aprovacao_gerente_marca">
                              Gerente Marca:
                              <i class="material-symbols-outlined">
                                task_alt
                              </i>
                            </span>
                            <span v-if="solicitation.aprovacao_gerente">
                              Gerente:
                              <i class="material-symbols-outlined">
                                task_alt
                              </i>
                            </span>
                            <span
                              v-if="solicitation.aprovacao_inspetor_qualidade"
                            >
                              Inspetor Qualidade:
                              <i class="material-symbols-outlined">
                                task_alt
                              </i>
                            </span>
                          </div>
                        </div>

                        <div
                          class="reposition-actions d-flex flex-row align-items-center justify-content-center"
                        >
                          <span
                            class="d-flex flex-row align-items-center checkbox-item"
                            v-if="
                              (decodeJwt().funcao === 'GERENTE' ||
                                decodeJwt().funcao === 'AUTOMACAO') &&
                              !solicitation.aprovacao_gerente &&
                              solicitation.motivo !== 'Falta Material'
                            "
                          >
                            Gerente:
                            <v-checkbox
                              value="true"
                              v-model="managerEvaluation"
                              color="success"
                            />
                          </span>

                          <span
                            class="d-flex flex-row align-items-center checkbox-item"
                            v-if="
                              (decodeJwt().funcao === 'GERENTE' ||
                                decodeJwt().funcao === 'AUTOMACAO') &&
                              !solicitation.aprovacao_gerente_marca &&
                              solicitation.motivo !== 'Falta Material'
                            "
                          >
                            Gerente de Marca:
                            <v-checkbox
                              value="true"
                              color="success"
                              v-model="brachManagerEvaluation"
                            />
                          </span>

                          <span
                            class="d-flex flex-row align-items-center checkbox-item"
                            v-if="
                              (decodeJwt().funcao === 'INSPETOR DE QUALIDADE' ||
                                decodeJwt().funcao === 'AUTOMACAO') &&
                              !solicitation.aprovacao_inspetor_qualidade &&
                              solicitation.defeito_material === true &&
                              solicitation.motivo !== 'Falta Material'
                            "
                          >
                            Inspetor(a) Qualidade:
                            <v-checkbox
                              value="true"
                              color="success"
                              v-model="inspectorEvaluation"
                            />
                          </span>

                          <span
                            class="d-flex flex-row align-items-center checkbox-item"
                            v-if="
                              (decodeJwt().funcao === 'GERENTE INDUSTRIAL' ||
                                decodeJwt().funcao === 'AUTOMACAO') &&
                              !solicitation.aprovacao_gerente_industrial &&
                              solicitation.motivo === 'Falta Material'
                            "
                          >
                            Gerente Industrial:
                            <v-checkbox
                              value="true"
                              color="success"
                              v-model="industrialManagerEvaluation"
                            />
                          </span>
                        </div>
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn
                          v-if="showButtonEvaluation(solicitation)"
                          text="Salvar Avaliação"
                          color="success"
                          variant="outlined"
                          @click="postEvaluation(solicitation)"
                        ></v-btn>

                        <v-btn
                          text="Fechar"
                          color="danger"
                          variant="outlined"
                          @click="isActive.value = false"
                        ></v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>
              </td>
              <td v-else></td>
            </tr>
          </tbody>
        </table>
        <LoadingComponent v-if="loading" size="150" width="15" />
      </div>
    </div>
  </div>
  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../../../ip";
import Alert from "../Alert.vue";
import LoadingComponent from "../LoadingComponent.vue";

export default {
  name: "SolicitacoesReposicao",
  components: { Alert, LoadingComponent },

  data() {
    return {
      solicitations: [],
      loading: true,
      evaluetedSolicitation: null,
      managerEvaluation: "false",
      brachManagerEvaluation: "false",
      inspectorEvaluation: "false",
      industrialManagerEvaluation: "false",
    };
  },

  mounted() {
    this.getSolicitations();
  },

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    authActions() {
      const validRoles = [
        "GERENTE",
        "GERENTE MARCA",
        "AUTOMACAO",
        "INSPETOR DE QUALIDADE",
      ];

      if (this.decodeJwt()) {
        if (validRoles.includes(this.decodeJwt().funcao)) {
          return true;
        }
      }
      return false;
    },

    solicitationStatus(solicitation, action) {
      if (solicitation.finalizado)
        return action ? { status: "Concluído", icon: "done_all" } : "finished";
      if (solicitation.estoque)
        return action
          ? { status: "Abastecimento Estoque", icon: "store" }
          : "stock";

      if (
        (solicitation.aprovacao_gerente &&
          solicitation.aprovacao_gerente_marca) ||
        (solicitation.aprovacao_gerente &&
          solicitation.aprovacao_gerente_marca &&
          solicitation.aprovacao_inspetor_qualidade) ||
        solicitation.aprovacao_gerente_industrial
      ) {
        return action
          ? { status: "Aguardando Liberação Consumo", icon: "pending_actions" }
          : "approved";
      }

      return action
        ? { status: "Pendente de Aprovação", icon: "hourglass_empty" }
        : "pendingg";
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

    getSolicitations() {
      axios
        .get(`http://${ip}:3023/get-solicitations`, {
          params: {
            unidade: "SEST",
          },
        })
        .then((response) => {
          this.solicitations = response.data;
          this.loading = false;
          console.log(this.solicitations);
        })
        .catch((error) => {
          console.error("Erro ao buscar solicitações: ", error);
        });
    },

    showButtonEvaluation(solicitation) {
      if (
        (solicitation.aprovacao_gerente === "true" &&
          solicitation.aprovacao_gerente_marca === "true") ||
        (solicitation.aprovacao_gerente === "true" &&
          solicitation.aprovacao_gerente_marca === "true" &&
          solicitation.aprovacao_inspetor_qualidade === "true") ||
        solicitation.aprovacao_gerente_industrial === "true"
      ) {
        return false;
      }
      return true;
    },

    postEvaluation(solicitation) {
      console.log(this.industrialManagerEvaluation);
      if (this.decodeJwt()) {
        const role = this.decodeJwt().funcao;
        const roleEvaluation = {
          // Alterar depois para GERENTE
          GERENTE: {
            evaluation: this.managerEvaluation,
            role: "aprovacao_gerente",
          },
          AUTOMACAO: {
            evaluation: this.brachManagerEvaluation,
            role: "aprovacao_gerente_marca",
          },
          "INSPETOR DE QUALIDADE": {
            evaluation: this.inspectorEvaluation,
            role: "aprovacao_inspetor_qualidade",
          },
          "GERENTE INDUSTRIAL": {
            evaluation: this.industrialManagerEvaluation,
            role: "aprovacao_gerente_industrial",
          },
        };

        axios
          .post(`http://${ip}:3023/post-evaluation`, {
            evaluation: roleEvaluation[role],
            role: role,
            id: solicitation.id,
            unidade: this.decodeJwt().unidade,
          })
          .then((response) => {
            this.$refs.alert.mostrarAlerta(
              "success",
              "done_outlined",
              "Sucesso",
              response.data
            );

            setTimeout(() => {
              window.location.reload();
            }, 1500);
          })
          .catch((error) => {
            console.error("Erro ao salvar avaliação: ", error);
            return this.$refs.alert.mostrarAlerta(
              "warning",
              "warning",
              "Error",
              error.response.data
            );
          });
      }
    },
  },
};
</script>

<style scoped>
.table-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 16px;
  text-align: left;
  table-layout: fixed;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

table thead {
  background-color: #000000;
  color: white;
}

table th,
table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

table tr:nth-child(even) {
  background-color: #f2f2f2;
}

table tbody tr:hover {
  background-color: #e9e9e9;
}

table th {
  font-weight: 600;
}

table td {
  color: #333;
}

table td:first-child,
table th:first-child {
  border-left: none;
}

table td:last-child,
table th:last-child {
  border-right: none;
}

table tr.start {
  background-color: #c3eecd;
}

table .small-col {
  width: 100px !important;
}

.small-col i {
  color: #419b64;
  transition:
    transform 0.3s ease,
    color 0.3s ease;
  transform-origin: center;
  background-color: #ecf8f2;
  padding: 8px;
  border-radius: 50%;
}

.small-col i:hover {
  transform: scale(1.1);
  color: #35a853;
}

.pendingg {
  background-color: #fff3cd !important; /* amarelo claro */
  color: #856404 !important;
}

.approved {
  background-color: #ffffff !important; /* verde claro */
  color: #419b64 !important;
}

.stock {
  background-color: #cce5ff !important; /* azul claro */
  color: #004085 !important;
}

.finished {
  background-color: #ddf8d7 !important; /* vermelho claro */
  color: #009e25 !important;
}

.status 

/* Lista de Peças */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: "Arial", sans-serif;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

li {
  padding: 10px;
  border-bottom: 1px solid #e9ecef;
}

li:last-child {
  border-bottom: none;
}

.peca-info {
  display: inline-block;
  font-weight: bold;
  color: #495057;
  margin-left: 5px;
}

.ordem-pedido {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #f3f0f0;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.approved-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.approved-list span {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.approved-list i {
  color: #009e25;
}

.reposition-info {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: "Arial", sans-serif;
  margin: 20px 0;
}

.info-column {
  padding: 10px;
}

.right {
  border-right: 1px solid black;
  padding-right: 40px;
}

.info-item {
  margin-top: 5px;
}

.info-item button {
  padding: 5px;
  border-radius: 10px;
  background-color: #cae2fc;
  border: #007bff 0.5px solid;
  text-align: center;
}

@media (max-width: 768px) {
  .reposition-info {
    flex-direction: column;
  }

  .right {
    border-right: none;
    padding-right: 0;
  }
}
</style>
