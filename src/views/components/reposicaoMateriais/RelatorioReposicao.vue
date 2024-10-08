<template>
  <v-dialog max-width="800">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        class="col-6 mb-4"
        v-bind="activatorProps"
        color="surface-variant"
        text="Preencher Relatório"
      ></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <h4 class="text-center">Relatório {{ model.nome }}</h4>
        </v-card-title>
        <v-card-text>
          <div class="report-container">
            <h5 class="text-center">Solicitante</h5>
            <div class="d-flex flex-row">
              <v-text-field
                v-model="solicitation.requesterRegistration"
                label="Matricula"
                type="number"
                @update:modelValue="
                  getEmployee(solicitation.requesterRegistration)
                "
              />

              <v-text-field
                disabled
                v-model="solicitation.requester.nome"
                label="Nome Colaborador"
                color="success"
              />
            </div>
            <v-divider></v-divider>

            <div class="solicitation-info">
              <h5 class="text-center">Informações do Pedido</h5>

              <div class="date d-flex flex-row mb-1">
                <v-text-field
                  class="pr-1"
                  v-model="solicitation.solicitationDate"
                  type="date"
                  label="Data Solicitação"
                />
                <v-text-field
                  v-model="solicitation.embarqueDate"
                  type="date"
                  label="Data Embarque"
                />
              </div>

              <div class="mb-1">
                <div class="d-flex flex-row mb-1">
                  <v-select
                    class="pr-1 col-6"
                    v-model="solicitation.turno"
                    :items="['TURNO A', 'TURNO B']"
                    label="Turno"
                  />

                  <v-text-field
                    class="col-6"
                    v-model="solicitation.cel"
                    label="Célula"
                    type="number"
                  />
                </div>

                <div class="d-flex flex-row">
                  <v-text-field
                    class="pr-1"
                    v-model="solicitation.request"
                    label="Pedido"
                  />

                  <v-text-field v-model="solicitation.order" label="Ordem" />
                </div>
              </div>

              <v-combobox
                v-model="solicitation.reason"
                item-title="nome"
                :items="reason"
                label="Motivo"
              />
              <v-divider></v-divider>

              <div class="pecas-selecionadas">
                <h5 class="text-center">Peças</h5>

                <div>
                  <span
                    class="d-flex flex-row align-items-center justify-content-center custom-checkbox"
                  >
                    <p>Falta de Material</p>
                    <input
                      type="checkbox"
                      v-model="solicitation.faltaMaterial"
                    />
                  </span>
                </div>

                <div v-if="!solicitation.faltaMaterial" class="pecas-info">
                  <div
                    class="peca-defeito d-flex flex-row align-items-center custom-checkbox"
                  >
                    <p>Defeito?</p>
                    <input
                      type="checkbox"
                      v-model="solicitation.defeitoMaterial"
                    />
                  </div>
                  <ul>
                    <li v-for="(peca, pecaIndex) in pecas" :key="pecaIndex">
                      <span class="peca-container">
                        <span
                          class="d-flex flex-row justify-content-center align-items-center"
                        >
                          <i
                            v-if="peca['tamanho'] && peca['quantidade']"
                            class="material-symbols-outlined mr-1 verified"
                          >
                            new_releases
                          </i>

                          <i
                            v-if="!peca['tamanho'] || !peca['quantidade']"
                            class="material-symbols-outlined mr-1 not-verified"
                          >
                            highlight_off
                          </i>
                          {{ peca.nome }}
                        </span>

                        <span>
                          <input
                            v-model="peca['tamanho']"
                            placeholder="Tamanho (cm)"
                            type="number"
                          />
                          <input
                            v-model="peca['quantidade']"
                            placeholder="Quantidade"
                            type="number"
                          />
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <v-divider></v-divider>

              <div class="responsaveis-reposicao row col-12">
                <h5 class="text-center">Avaliadores</h5>

                <div class="col-6">
                  <v-combobox
                    :items="branchManagers"
                    item-title="nome"
                    item-value="matricula"
                    v-model="solicitation.evaluators.branchManager"
                    label="Gerente de Marca"
                  />

                  <v-combobox
                    :items="managers"
                    item-title="nome"
                    item-value="matricula"
                    v-model="solicitation.evaluators.manager"
                    label="Gerente"
                  />
                </div>

                <div class="col-6">
                  <v-combobox
                    :items="qualityInspectors"
                    item-title="nome"
                    item-value="matricula"
                    v-model="solicitation.evaluators.qualityInspector"
                    label="Inspetor Qualidade"
                  />

                  <v-combobox
                    :items="coordinators"
                    item-title="nome"
                    item-value="matricula"
                    v-model="solicitation.evaluators.coordinator"
                    label="Coordenador"
                  />
                </div>
              </div>

              <v-divider></v-divider>

              <div class="aviamento mb-2">
                <v-expansion-panels>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      Solicitação Aviamento?
                    </v-expansion-panel-title>

                    <v-expansion-panel-text>
                      <v-combobox
                        v-model="solicitation.wareHouse"
                        :items="wareHouseItems"
                        item-title="nome"
                        item-value="codigo"
                        label="Itens Aviamento"
                        clearable
                        chips
                        color="success"
                      />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <div
                class="d-flex flex-column justify-content-center align-items-center mt-5"
              >
                <v-btn @click="teste" color="success" variant="flat">
                  Solicitar Material
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="Fechar Relatório"
            color="danger"
            variant="outlined"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import axios from "axios";
import ip from "../../../ip";

export default {
  name: "RelatorioReposicao",

  props: {
    model: {
      type: Object,
    },
    pecas: {
      type: Array,
    },
  },

  components: {},

  data() {
    return {
      aviamento: false,

      solicitation: {
        faltaMaterial: false,
        defeitoMaterial: false,
        materiaisNaoDisponiveis: [],
        model: this.model,
        requester: "",
        requesterRegistration: null,
        solicitationDate: "",
        embarqueDate: "",
        cel: null,
        turno: "",
        request: "",
        order: "",
        pecas: [],
        reason: "",
        evaluators: {
          branchManager: null,
          manager: null,
          qualityInspector: null,
          coordinator: null,
        },
        wareHouse: [],
      },

      branchManagers: [],
      managers: [],
      qualityInspectors: [],
      coordinators: [],
      wareHouseItems: [],
      reason: [],
    };
  },

  mounted() {
    this.getManagers();
    this.getQualityInspector();
    this.getMotivoPedido();
  },

  methods: {
    teste() {
      this.solicitation.pecas = this.pecas;
      console.log(this.solicitation);
    },

    postSolicitatio() {
      axios
        .post(`http://${ip}:3023/post-solicitation`, {
          data: this.solicitation,
          unidade: "SEST",
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(`Erro ao solicitar reposição: ${error}`);
        });
    },

    getManagers() {
      axios
        .get(`http://${ip}:3023/get-managers`, {
          params: {
            unidade: "SEST",
          },
        })
        .then((response) => {
          this.branchManagers = response.data.branch;
          this.managers = response.data.manager;
        })
        .catch((error) => {
          console.error("Erro ao buscar gerentes: ", error);
        });
    },

    getMotivoPedido() {
      axios
        .get(`http://${ip}:3023/motivo-pedido`, {
          params: {
            unidade: "SEST",
          },
        })
        .then((response) => {
          this.reason = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar inspetoras de qualidade: ", error);
        });
    },

    getQualityInspector() {
      axios
        .get(`http://${ip}:3023/get-quality-inspectors-coordinators`, {
          params: {
            unidade: "SEST",
          },
        })
        .then((response) => {
          this.qualityInspectors = response.data.quality;
          this.coordinators = response.data.coordinator;
        })
        .catch((error) => {
          console.error("Erro ao buscar inspetoras de qualidade: ", error);
        });
    },

    getEmployee(registration) {
      if (registration.length === 7) {
        axios
          .get(`http://${ip}:3023/get-employee`, {
            params: {
              unidade: "SEST",
              registration: registration,
            },
          })
          .then((response) => {
            this.solicitation.requester = response.data;
          })
          .catch((error) => {
            console.error("Erro ao buscar colcaborador: ", error);
          });
      }
    },
  },
};
</script>

<style scoped>
.peca-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.report-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.pecas-selecionadas input {
  padding: 10px;
  margin-right: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

ul {
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  list-style-type: none;
  padding-left: 0;
}

.verified {
  background-color: #53b257;
  color: #fff;
  padding: 2px;
  border-radius: 50%;
}

.not-verified {
  background-color: #e97b6c;
  color: #fff;
  padding: 2px;
  border-radius: 50%;
}

.custom-checkbox p {
  margin-right: 10px;
  font-size: 16px;
  color: #333;
  margin-bottom: 0;
}

.custom-checkbox input {
  appearance: none; /* Remove o estilo padrão */
  background-color: #fff; /* Fundo branco */
  border: 2px solid #bbb; /* Borda sólida */
  padding: 5px; /* Padding interno para o checkbox */
  width: 20px; /* Largura fixa */
  height: 20px; /* Altura fixa */
  cursor: pointer; /* Cursor de mão quando hover */
  transition:
    background-color 0.3s,
    border-color 0.3s; /* Transição suave para cores */
}

.custom-checkbox input:checked {
  background-color: #007bff; /* Fundo azul quando marcado */
  border-color: #007bff; /* Borda azul quando marcado */
}

.custom-checkbox input:focus {
  outline: none; /* Remove o contorno ao focar */
  border-color: #66afe9; /* Cor da borda ao focar */
}
</style>
