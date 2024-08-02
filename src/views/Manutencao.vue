<template>
  <div class="container-manutencao">
    <div class="wrapper-manutencao">
      <h5 class="mb-3 text-primary">Manual de Máquinas</h5>

      <div class="mb-5" v-if="permissaoManut()">
        <v-expansion-panels>
          <v-expansion-panel title="Cadastrar Máquina">
            <v-expansion-panel-text>
              <cadastro-defeitos @informacoes-salvas="informacoesSalvas" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <div class="select-lists pb-5">
        <div class="setor-select select mb-3">
          <v-select
            variant="solo-filled"
            label="Setores"
            :items="setores"
            v-model="setor"
            @update:modelValue="
              maquina = '';
              adicionaFiltro();
            "
            outlined
            max-width="auto"
          ></v-select>
        </div>

        <div class="maquina-select select">
          <v-select
            variant="solo-filled"
            label="Máquinas"
            :items="maquinas"
            v-model="maquina"
            @update:modelValue="adicionaFiltro()"
            outlined
            max-width="auto"
          ></v-select>
        </div>
      </div>

      <div>
        <div class="d-flex flex-column align-items-center justify-content-center">
          <p class="text-primary">Deseja aplicar um filtro?</p>
          <div class="buttons">
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
        </div>
        <div class="setores-list" v-for="(maquinas, setorNome) in maquinasObject" :key="setorNome">
          <h5 class="text-primary text-center">{{ setorNome }}</h5>
          <div class="maquinas-list" v-if="maquinas">
            <div class="maquina" v-for="(categorias, maquinaNome) in maquinas" :key="maquinaNome">
              <v-expansion-panels>
                <v-expansion-panel class="toggle-button" :title="maquinaNome">
                  <v-expansion-panel-text>
                    <div class="categoria" v-for="(problemas, categoriaNome) in categorias" :key="categoriaNome">
                      <v-expansion-panels>
                        <v-expansion-panel class="toggle-button" :title="categoriaNome">
                          <v-expansion-panel-text>
                            <div v-if="problemas.length > 0">
                              <v-list class="problemas-list">
                                <v-list-item
                                  v-for="(problema, problemaId) in problemas"
                                  :key="problemaId"
                                  :value="problema"
                                  color="primary"
                                  class="d-flex justify-content-between align-items-center border-bottom border-1r problema-item"
                                >
                                  <v-list-item-title class="text-wrap">{{ problema }}</v-list-item-title>
                                  <template v-slot:append>
                                    <i style="color: #2196f3; font-size: 1.25rem" class="material-icons-round opacity-10 fs-4">{{
                                      getIcon(problema)
                                    }}</i>
                                  </template>
                                </v-list-item>
                              </v-list>
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

<style>
.categoria-mecanico,
.categoria-operacional {
  transition:
    background-color 0.3s,
    color 0.3s;
}

.categoria-mecanico.active,
.categoria-operacional.active {
  background-color: #ffeb3b !important;
  color: #000; /* Cor do texto para botão ativo */
}
.select-lists {
  display: flex;
  flex-direction: row;
}

.title {
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title h1 {
  font-size: 35px;
  color: #0056b3;
  margin-top: 0;
}

.title .v-img {
  width: 150px;
  padding-right: 20px;
}

.select {
  width: 300px;
  padding: 0 10px;
}

.escolher-categoria {
  margin-bottom: 20px;
  padding: 10px;
}

.categoria-mecanico {
  margin: 0 10px;
  background-color: #add1f8 !important;
}

.categoria-operacional {
  margin: 0 10px;
  background-color: rgb(247, 204, 204) !important;
}

.select-lists {
  display: flex;
  flex-direction: row;
}

.select {
  display: flex;
  flex-direction: column;
}

.container-manutencao {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.wrapper-manutencao {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 1200px;
  padding: 30px;
  background-color: #ffffff;
  box-shadow: 0 2rem 3rem rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.maquinas-list {
  cursor: pointer;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 18px;
  padding: 20px;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
  border-bottom: rgba(0, 0, 0, 0.1) 1px solid;
}

.maquinas-list:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.toggle-button {
  cursor: pointer;
  color: #333;
  font-weight: 500;
  font-size: 20px;
  margin-bottom: 5px;
}

.toggle-button:hover {
  color: #1f75fe;
}

.cadastro-painel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.categoria {
  background: transparent;
}

.categoria .toggle-button {
  padding: 0;
  margin: 10px;
  font-size: 20px !important;
}

.categoria ul li::before {
  content: "🔧";
  margin-right: 10px;
  font-size: 18px;
}

.problema-item {
  max-width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  color: #333;
  position: relative;
}

.problema-item .v-img {
  position: absolute;
  right: 10px;
  width: 35px;
}

@media (max-width: 1200px) {
  .select-lists {
    flex-direction: column;
  }

  .select {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .wrapper-manutencao {
    padding: 20px;
  }

  .title h1 {
    font-size: 28px;
  }

  .title .v-img {
    width: 100px;
  }

  .pesquisa-btn {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .wrapper-manutencao {
    padding: 15px;
  }

  .problema-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
