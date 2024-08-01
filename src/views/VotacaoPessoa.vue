<template>
  <div class="main">
    <h2 class="text-center">Realize a votação dentre essas pessoas</h2>

    <div v-if="autorization()">
      <CadastroEleicao />
    </div>

    <div>
      <CadastroCandidate />
    </div>

    <div class="cadastro-candidate"></div>

    <div class="choices">
      <v-expansion-panels class="pa-4" variant="popout">
        <div v-if="candidates.length > 0">
          <v-expansion-panel v-for="(people, peopleIndex) in candidates" :key="peopleIndex" hide-actions>
            <v-expansion-panel-title class="candidate-info">
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
</style>
