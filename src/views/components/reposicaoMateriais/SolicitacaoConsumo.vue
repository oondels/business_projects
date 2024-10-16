<template>
  <div
    class="reposicao-consumo d-flex flex-column justify-content-center align-items-center"
  >
    <h4 class="text-center">Solicitações Aprovadas</h4>

    <table>
      <thead>
        <tr>
          <th>Modelo</th>
          <th>Solicitante</th>
          <th>Célula</th>
          <th>Ordem</th>
          <th>Pedido</th>
          <th v-if="solicitationActions()">Informações</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="solicitation in filteredSolicitations()"
          :key="solicitation.id"
          :class="[
            solicitationStatus(solicitation),
            solicitation.estoque_start ? 'start-stock' : '',
          ]"
        >
          <td>{{ solicitation.modelo }}</td>
          <td>{{ solicitation.solicitante }}</td>
          <td>{{ solicitation.celula }}</td>
          <td>{{ solicitation.ordem }}</td>
          <td>{{ solicitation.pedido }}</td>
          <td v-if="solicitationActions()">
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
                              <button v-bind="activatorProps">Ver Peças</button>
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
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                      v-if="!solicitation.estoque"
                      @click="
                        updateSolicitation(solicitation.id, 'consumption')
                      "
                      text="Liberar para Estoque"
                      color="success"
                      variant="outlined"
                    ></v-btn>

                    <v-dialog max-width="600">
                      <template v-slot:activator="{ props: activatorProps }">
                        <v-btn
                          v-bind="activatorProps"
                          v-if="
                            solicitationActions &&
                            solicitation.estoque &&
                            !solicitation.estoque_end
                          "
                          :text="
                            solicitation.estoque_start
                              ? 'Finalizar Abastecimento'
                              : 'Iniciar Abastecimento'
                          "
                          color="success"
                          variant="outlined"
                        ></v-btn>
                      </template>

                      <template v-slot:default="{ isActive }">
                        <v-card title="Atualizar Solicitação">
                          <v-card-text>
                            <span class="text-center">
                              Insira matrícula para prosseguir (Completa)
                            </span>

                            <v-text-field
                              type="text"
                              v-model="registrationUserEstoque"
                              label="Matrícula"
                              @input="getStockUserName"
                            ></v-text-field>

                            <v-text-field
                              disabled
                              type="text"
                              v-model="userEstoqueName"
                              label="Nome"
                            ></v-text-field>
                          </v-card-text>

                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                              v-if="
                                registrationUserEstoque &&
                                registrationUserEstoque.length >= 5 &&
                                userEstoqueName &&
                                solicitationActions &&
                                solicitation.estoque &&
                                !solicitation.estoque_end
                              "
                              @click="
                                updateSolicitation(
                                  solicitation.id,
                                  solicitation.estoque_start ? 'stop' : 'start'
                                )
                              "
                              :text="
                                solicitation.estoque_start
                                  ? 'Finalizar Abastecimento'
                                  : 'Iniciar Abastecimento'
                              "
                              color="success"
                              variant="outlined"
                            ></v-btn>

                            <v-btn
                              text="Fechar"
                              @click="
                                isActive.value = false;
                                userEstoqueName = '';
                                registrationUserEstoque = null;
                              "
                            ></v-btn>
                          </v-card-actions>
                        </v-card>
                      </template>
                    </v-dialog>

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

    <LoadingComponent v-if="loading" size="150" width="15" />
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
  name: "SolicitacaoConsumo",
  components: { Alert, LoadingComponent },

  data() {
    return {
      solicitations: [],
      loading: true,
      registrationUserEstoque: null,
      userEstoqueName: "",
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

    solicitationStatus(solicitation) {
      if (solicitation.estoque) return "stock";

      return "pending";
    },

    solicitationActions() {
      if (this.decodeJwt()) {
        if (
          this.decodeJwt().usuario === "ESTOQUE.ABASTECIMENTO" ||
          this.decodeJwt().funcao === "AUTOMACAO" ||
          this.decodeJwt().funcao === "CONSUMO"
        ) {
          return true;
        }
      }
      return false;
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
        })
        .catch((error) => {
          console.error("Erro ao buscar solicitações: ", error);
        });
    },

    getStockUserName() {
      if (this.registrationUserEstoque.length === 7) {
        axios
          .get(`http://${ip}:3023/get-user-stock-name`, {
            params: { registration: this.registrationUserEstoque },
          })
          .then((response) => {
            console.log(response.data);
            this.userEstoqueName = response.data;
          })
          .catch((error) => {
            console.error("Erro buscat nome do usuario:", error.response.data);
          });
      }
    },

    updateSolicitation(id, action) {
      axios
        .put(`http://${ip}:3023/update-solicitation`, {
          solicitationId: id,
          user: this.decodeJwt().usuario,
          action: action,
          userStockRegistration: this.registrationUserEstoque,
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
          console.error(`Erro ao iniciar solicitação: ${error}`);
        });
    },

    filteredSolicitations() {
      return this.solicitations.filter((solicitation) => {
        if (
          this.decodeJwt().usuario === "ESTOQUE.ABASTECIMENTO" ||
          this.decodeJwt().funcao === "AUTOMACAO"
        ) {
          // Solicitações para Estoque
          return (
            // Aprovação de gerente e gerente de marca
            (!solicitation.defeito_material &&
              solicitation.aprovacao_gerente === "true" &&
              !solicitation.finalizado &&
              solicitation.estoque &&
              solicitation.aprovacao_gerente_marca === "true") ||
            // Aprocação quando a defeito material
            (solicitation.aprovacao_gerente === "true" &&
              solicitation.aprovacao_gerente_marca === "true" &&
              !solicitation.finalizado &&
              solicitation.estoque &&
              solicitation.aprovacao_inspetor_qualidade === "true") ||
            // Aprovação gerente industrial
            (!solicitation.finalizado &&
              solicitation.aprovacao_gerente_industrial === "true")
          );
        }
        // Solicitações para Consumo
        return (
          // Aprovação de gerente e gerente de marca
          (!solicitation.defeito_material &&
            solicitation.aprovacao_gerente === "true" &&
            solicitation.aprovacao_gerente_marca === "true" &&
            !solicitation.finalizado &&
            !solicitation.estoque) ||
          // Aprocação quando a defeito material
          (solicitation.aprovacao_gerente === "true" &&
            solicitation.aprovacao_gerente_marca === "true" &&
            !solicitation.finalizado &&
            !solicitation.estoque &&
            solicitation.aprovacao_inspetor_qualidade === "true") ||
          // Aprovação gerente industrial
          (!solicitation.finalizado &&
            !solicitation.estoque &&
            solicitation.aprovacao_gerente_industrial === "true")
        );
      });
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

.start-stock {
  background-color: #cdffd0 !important;
  color: #419b64 !important;
}

.pending {
  background-color: #ffffff !important;
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
