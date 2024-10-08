<template>
  <div>
    <div class="solicitacoes">
      <h4 class="text-center">Solicitações Realizadas</h4>

      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Modelo</th>
            <th>Solicitante</th>
            <th>Célula</th>
            <th>Ordem</th>
            <th>Pedido</th>
            <th v-if="authActions()">Ação</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="solicitation in solicitations"
            :key="solicitation.id"
            :class="solicitation.iniciado ? 'start' : 'pending'"
          >
            <td v-if="solicitation.iniciado">Iniciado</td>
            <td v-else>Não iniciado</td>
            <td>{{ solicitation.modelo }}</td>
            <td>{{ solicitation.solicitante }}</td>
            <td>{{ solicitation.celula }}</td>
            <td>{{ solicitation.ordem }}</td>
            <td>{{ solicitation.pedido }}</td>
            <td v-if="authActions()">
              <v-dialog max-width="700">
                <template v-slot:activator="{ props: activatorProps }">
                  <i
                    @click="teste"
                    v-bind="activatorProps"
                    role="button"
                    class="material-icons"
                  >
                    info
                  </i>
                </template>

                <template v-slot:default="{ isActive }">
                  <v-card
                    :title="'Solicitação de peças para ' + solicitation.modelo"
                  >
                    <v-card-text>
                      <div class="title-reposicao">
                        <h5 class="text-center">
                          Requisição feita por
                          <strong>{{ solicitation.solicitante }}</strong>
                        </h5>
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
                              {{ formatteDate(solicitation.data_solicitacao) }}
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
                                            Quantidade: {{ peca.quantidade }} |
                                            Tamanho: {{ peca.tamanho }}cm
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

                      <div
                        class="reposition-actions d-flex flex-row align-items-center justify-content-center"
                      >
                        <span
                          class="d-flex flex-row align-items-center checkbox-item"
                          v-if="
                            (decodeJwt().funcao === 'GERENTE' ||
                              decodeJwt().funcao === 'AUTOMACAO') &&
                            !solicitation.aprovacao_gerente &&
                            !solicitation.falta_material
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
                            !solicitation.falta_material
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
                            !solicitation.falta_material
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
                            solicitation.falta_material
                          "
                        >
                          Gerente Industrial:
                          <v-checkbox
                            value="true"
                            color="success"
                            v-model="inspectorEvaluation"
                          />
                        </span>
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
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
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../../../ip";

export default {
  name: "SolicitacoesReposicao",
  components: {},

  data() {
    return {
      solicitations: [],

      evaluetedSolicitation: null,
      managerEvaluation: "false",
      brachManagerEvaluation: "false",
      inspectorEvaluation: "false",
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

    teste() {
      console.log(this.decodeJwt().funcao);
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
          console.log(this.solicitations);
        })
        .catch((error) => {
          console.error("Erro ao buscar solicitações: ", error);
        });
    },

    postEvaluation() {
      console.log(this.managerEvaluation);
      // if (this.decodeJwt()) {
      //   const role = this.decodeJwt().funcao;
      //   const roleEvaluation = {
      //     // Alterar depois para GERENTE
      //     AUTOMACAO: this.managerEvaluation,
      //     "GERENTE MARCA": this.brachManagerEvaluation,
      //     "INSPETOR DE QUALIDADE": this.inspectorEvaluation,
      //   };

      //   axios
      //     .post(`http://${ip}:3023/post-evaluation`, {
      //       evaluation: roleEvaluation[role],
      //       role: role,
      //       id: solicitation.id,
      //     })
      //     .then((response) => {
      //       console.log(response.data);
      //     })
      //     .catch((error) => {
      //       console.error("Erro ao salvar avaliação: ", error);
      //     });
      // }
    },
  },
};
</script>

<style scoped>
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

table thead {
  background-color: #007bff;
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
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
