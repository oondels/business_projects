<template>
  <div class="container my-5 p-4 bg-light rounded shadow-sm">
    <h5 class="mb-3 text-primary">Manual de Máquinas</h5>

    <div class="mb-3" v-if="permissaoManut()">
      <v-expansion-panels>
        <v-expansion-panel title="Cadastrar Máquina">
          <v-expansion-panel-text>
            <cadastro-defeitos @informacoes-salvas="informacoesSalvas" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div class="row mb-4">
      <div class="col-md-6 mb-3 mb-md-0">
        <v-select
          variant="outlined"
          density="compact"
          label="Setores"
          :items="setores"
          v-model="setor"
          @update:modelValue="
            maquina = '';
            adicionaFiltro();
          "
          outlined
        ></v-select>
      </div>

      <div class="col-md-6">
        <v-select
          variant="outlined"
          density="compact"
          label="Máquinas"
          :items="maquinas"
          v-model="maquina"
          @update:modelValue="adicionaFiltro()"
          outlined
        ></v-select>
      </div>
    </div>

    <div>
      <div class="mb-3">
        <p class="text-primary">Deseja aplicar um filtro?</p>
        <button
          :class="{
            'btn-success': tipo === 'Mecânico',
          }"
          class="btn btn-secondary me-2"
          @click="filtroDefeitos('Mecânico')"
        >
          Mecânico
        </button>
        <button
          :class="{ 'btn-success': tipo === 'Operacional' }"
          class="btn btn-secondary"
          @click="filtroDefeitos('Operacional')"
        >
          Operacional
        </button>
      </div>
      <div v-for="(maquinas, setorNome) in maquinasObject" :key="setorNome">
        <h5 class="my-4 text-blue">{{ setorNome }}</h5>
        <div v-if="maquinas">
          <div v-for="(categorias, maquinaNome) in maquinas" :key="maquinaNome">
            <v-expansion-panels>
              <v-expansion-panel class="mb-3" :title="maquinaNome">
                <v-expansion-panel-text>
                  <div v-for="(problemas, categoriaNome) in categorias" :key="categoriaNome">
                    <v-expansion-panels>
                      <v-expansion-panel class="mb-2" :title="categoriaNome">
                        <v-expansion-panel-text>
                          <div v-if="problemas.length > 0">
                            <v-card class="card mx-auto p-2" max-width="700">
                              <v-list>
                                <v-list-item
                                  v-for="(problema, problemaId) in problemas"
                                  :key="problemaId"
                                  :value="problema"
                                  color="primary"
                                  rounded="xl"
                                  class="list-group-item d-flex justify-content-between align-items-center border-bottom border-1r"
                                >
                                  <v-list-item-title class="text-wrap">{{ problema }}</v-list-item-title>
                                  <template v-slot:append>
                                    <i style="color: #2196f3; font-size: 1.25rem" class="material-icons-round opacity-10 fs-4">{{
                                      getIcon(problema)
                                    }}</i>
                                  </template>
                                </v-list-item>
                              </v-list>
                            </v-card>
                          </div>
                          <div v-else>
                            <p class="text-muted">Sem Informações Cadastradas para esta categoria.</p>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
        <div v-else>
          <h4>Sem máquinas no setor!</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../ip";
import CadastroDefeitos from "./components/manutencao/CadastroDefeitos.vue";

export default {
  name: "manutencao-component",
  components: {
    CadastroDefeitos,
  },
  data() {
    return {
      setores: [],
      setor: "Apoio",
      maquinas: [],
      maquina: "",
      maquinasObject: {},
      maquinasObjectOriginal: {},
      tipo: "",

      mostraDados: false,
    };
  },

  mounted() {
    this.adicionaFiltro();
  },

  methods: {
    informacoesSalvas() {
      this.adicionaFiltro();
    },

    adicionaFiltro() {
      this.queryMaquinas({
        setor: this.setor,
        maquina: this.maquina,
        tipo: this.tipo,
      });
    },

    getIcon(tag) {
      if (tag.includes("Mecânico") || tag.includes("Mecanico")) {
        return "settings";
      }
      return "person";
    },

    queryMaquinas(filtro) {
      this.mostraDados = false;
      axios
        .get(`http://${ip}:3042/api/manual_maqs`, { params: { filtro: filtro } })
        .then((response) => {
          this.maquinasObject = response.data.manualMaquinas;
          this.maquinas = response.data.maquinas;
          this.setores = response.data.setores;

          this.mostraDados = true;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },
    permissaoManut() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (
        this.decodeJwt().setor === "AUTOMACAO" ||
        this.decodeJwt().usuario === "SERGIO.GONCALVES" ||
        this.decodeJwt().usuario === "WESLEY.REIS" ||
        this.decodeJwt().usuario === "EDILSON.SANTANA" ||
        this.decodeJwt().usuario === "MARIA.CALMON" ||
        this.decodeJwt().usuario === "NATALIA.REBOUCAS" ||
        this.decodeJwt().usuario === "MONICA.LEITE"
      ) {
        return true;
      }
    },

    filtroDefeitos(tipo) {
      if (this.tipo === tipo) {
        this.tipo = "";
      } else {
        this.tipo = tipo;
      }
      this.adicionaFiltro();
    },
  },
};
</script>

<style></style>
