<template>
  <div class="reposicao-consumo">
    <h4 class="text-center">Solicitações Aprovadas</h4>

    <table>
      <thead>
        <tr>
          <th>Ação</th>
          <th>Modelo</th>
          <th>Solicitante</th>
          <th>Célula</th>
          <th>Ordem</th>
          <th>Pedido</th>
          <th>Informações</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="solicitation in filteredSolicitations()"
          :key="solicitation.id"
        >
          <td>
            <v-btn @click="startSolicitation(solicitation.id)">
              {{ !solicitation.iniciado ? "Iniciar" : "Finalizar" }}
            </v-btn>
          </td>
          <td>{{ solicitation.modelo }}</td>
          <td>{{ solicitation.solicitante }}</td>
          <td>{{ solicitation.celula }}</td>
          <td>{{ solicitation.ordem }}</td>
          <td>{{ solicitation.pedido }}</td>
          <td>
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
                      <h6 class="text-center">
                        Requisição feita por
                        <strong>{{ solicitation.solicitante }}</strong>
                      </h6>
                    </div>

                    <div class="ordem-pedido">
                      <span>Ordem: {{ solicitation.ordem }}</span>
                      <span>Pedido: {{ solicitation.pedido }}</span>
                    </div>

                    <div class="reposition-info">
                      <div class="info-column">
                        <div class="info-item">
                          <strong>Data Solicitação: </strong>
                          <span>{{ solicitation.data_solicitacao }}</span>
                        </div>
                        <div class="info-item">
                          <strong>Data Embarque: </strong>
                          <span>{{ solicitation.data_embarque }}</span>
                        </div>
                        <div class="info-item">
                          <strong>Célula: </strong>
                          <span>{{ solicitation.celula }}</span>
                        </div>
                      </div>

                      <div class="info-column">
                        <div class="info-item">
                          <strong>Motivo:</strong>
                          <span>{{ solicitation.motivo }}</span>
                        </div>

                        <div class="info-item">
                          <strong>Aprovações:</strong>
                          <span>Listar aprovações</span>
                        </div>

                        <div class="info-item">
                          <strong>Peças:</strong>

                          <v-dialog max-width="600">
                            <template
                              v-slot:activator="{ props: activatorProps }"
                            >
                              <v-btn
                                v-bind="activatorProps"
                                color="surface-variant"
                                text="Open Dialog"
                                variant="flat"
                              ></v-btn>
                            </template>

                            <template v-slot:default="{ isActive }">
                              <v-card title="Peças Solicitadas">
                                <v-card-text>
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
                      @click="startSolicitation(solicitation.id)"
                      text="Iniciar"
                      color="success"
                      variant="outlined"
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
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../../../ip";

export default {
  name: "SolicitacaoConsumo",
  components: {},

  data() {
    return {
      solicitations: [],
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

    getSolicitations() {
      axios
        .get(`http://${ip}:3023/get-solicitations`, {
          params: {
            unidade: "SEST",
          },
        })
        .then((response) => {
          this.solicitations = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar solicitações: ", error);
        });
    },

    startSolicitation(id) {
      axios
        .put(`http://${ip}:3023/start-solicitation`, {
          solicitationId: id,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(`Erro ao iniciar solicitação: ${error}`);
        });
    },

    filteredSolicitations() {
      return this.solicitations.filter((solicitation) => {
        return (
          // Aprovação de gerente e gerente de marca
          (!solicitation.falta_material &&
            !solicitation.defeito_material &&
            solicitation.aprovacao_gerente === "true" &&
            solicitation.aprovacao_gerente_marca === "true") ||
          // Aprocação quando a defeito material
          (solicitation.aprovacao_gerente === "true" &&
            solicitation.aprovacao_gerente_marca === "true" &&
            solicitation.aprovacao_inspetor_qualidade === "true") ||
          // Aprovação gerente industrial
          solicitation.aprovacao_gerente_industrial === "true"
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
</style>
