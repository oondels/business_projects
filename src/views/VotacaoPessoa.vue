<template>
  <div class="main">
    <h2 class="text-center">Realize a votação dentre essas pessoas</h2>

    <div class="cadastros">
      <CadastroEleicao />
      <CadastroCandidate />
    </div>

    <div class="choices">
      <v-expansion-panels class="pa-4" variant="popout">
        <div v-if="candidates.length > 0">
          <v-expansion-panel v-for="(people, peopleIndex) in candidates" :key="peopleIndex" hide-actions>
            <v-expansion-panel-title class="candidate-info d-flex flex-row align-items-center justify-content-between">
              <div><v-img class="image-candidate" src="./img/foto_colaborador/favicon.png"></v-img></div>
              <div class="nome">{{ people.nome }}</div>
            </v-expansion-panel-title>

            <v-expansion-panel-text class="bg-light">
              <v-card-text>
                <v-dialog transition="dialog-bottom-transition" width="auto">
                  <template v-slot:activator="{ props: activatorProps }">
                    <div class="info-candidate">
                      <div class="info-header">
                        <h3>Informações</h3>
                      </div>
                      <div class="info-content">
                        <p>Gerente: {{ people.gerente }}</p>
                        <p>Setor:{{ people.nome_setor }}</p>
                        <v-btn class="vote-btn" color="success" v-bind="activatorProps" text="Votar"></v-btn>
                      </div>
                    </div>
                  </template>

                  <v-card>
                    <div class="text-capitalize p-3 bg-success">Registrar voto para: {{ people.nome }}</div>

                    <v-card-text class="bg-light text-h4 pa-5">
                      <NfcReader @nfcData="(nfcData) => validadeVote(nfcData, people)" />
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </v-card-text>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </div>
        <div v-else><h4>Sem candidatos cadastros para votação!</h4></div>
      </v-expansion-panels>
    </div>
  </div>
  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../ip";
import Alert from "./components/Alert.vue";
import CadastroCandidate from "./components/CadastroCandidate.vue";
import CadastroEleicao from "./components/CadastroEleicao.vue";
import NfcReader from "./components/NfcReader.vue";

export default {
  name: "VotacaoPessoa",
  components: { NfcReader, Alert, CadastroEleicao, CadastroCandidate },

  data() {
    return {
      choiceVote: "",
      candidates: [],
    };
  },

  mounted() {
    this.getCandidates();
  },

  methods: {
    getCandidates() {
      axios
        .get(`http://${ip}:3043/get-candidates`)
        .then((response) => {
          this.candidates = response.data;
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    },

    postVote(employeeVote, choice) {
      const vote = {
        employee: employeeVote,
        choice: choice,
      };

      axios
        .post(`http://${ip}:3043/post-vote`, vote)
        .then(() => {
          this.$refs.alert.mostrarAlerta("success", "done_outline", "Sucesso", `Voto Computado para: ${choice.nome}`);
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta("danger", "warning", "Erro", "Erro ao computar Voto!");
          console.error("Error:", error);
        });
    },

    validadeVote(data, choice) {
      this.choiceVote = choice;
      axios
        .get(`http://${ip}:3043/validate-vote`, { params: { userRfid: data } })
        .then((response) => {
          this.postVote(response.data, choice);
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta("warning", "report", "Erro!", error.response.data);
          console.error("Error:", error);
        });
    },

    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    autorization() {
      if (!this.decodeJwt()) {
        return false;
      }
      if (this.decodeJwt().setor === "AUTOMACAO") {
        return true;
      }
    },
  },
};
</script>

<style>
.main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.info-candidate {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 400px;
  text-align: center;
  margin: auto;
}

.info-header h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.5em;
  border-bottom: 2px solid #0d9757;
  display: inline-block;
  padding-bottom: 5px;
}

.info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-content p {
  font-size: 1.1em;
  color: #555;
  margin: 10px 0;
}

.vote-btn {
  margin-top: 20px;
  font-size: 1em;
  padding: 10px 20px;
  border-radius: 4px;
}

.main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.cadastros {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 80%;
  width: 80%;
  margin-bottom: 20px;
  border-radius: 20px;
  background-color: #f8f8f8;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.cadastro-eleicao,
.cadastro-candidate {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
  width: 45%;
  text-align: center;
}

.image-candidate {
  width: 36px;
}

.nome {
  padding-left: 60px;
}

@media only screen and (max-width: 750px) {
  .cadastros {
    display: flex;
    flex-direction: column;
  }

  .cadastro-eleicao,
  .cadastro-candidate {
    width: 100%;
    justify-content: center;
    align-items: center;
  }
}
</style>
