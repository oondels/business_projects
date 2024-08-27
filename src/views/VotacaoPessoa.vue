<template>
  <div class="main">
    <h2 class="text-center">Realize a votação dentre essas pessoas</h2>

    <div class="show-results">
      <v-expansion-panels class="pa-4">
        <v-expansion-panel>
          <v-expansion-panel-title class="candidate-info d-flex flex-row align-items-center justify-content-between"
            >Exibir Resultados</v-expansion-panel-title
          >
          <v-expansion-panel-text class="bg-light">
            <div class="ranking mb-5">
              <h3><i class="material-icons">star</i> Ranking Votações</h3>
              <div v-if="totalVotes" class="result-ranking">
                <div v-for="(vote, voteIndex) in totalVotes" :key="voteIndex" class="vote-item">
                  <div>
                    <i class="material-icons">person</i>
                    {{ vote.candidato_name }}
                  </div>

                  <div>
                    <span class="votes">
                      <i class="material-icons">how_to_vote</i>
                      {{ vote.total_votos }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="no-results">
                <i class="material-icons">info</i>
                Sem Resultados Computados
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div>
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>Cadastros</v-expansion-panel-title>
          <v-expansion-panel-text class="bg-light">
            <div class="cadastros">
              <CadastroEleicao />
              <CadastroCandidate :polls="polls" />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div v-if="candidates.length > 0">
      <div v-for="(poll, pollId) in polls" :key="pollId" class="choices">
        <h4 class="text-center mt-8">{{ poll.name }}</h4>
        <div v-for="(people, peopleIndex) in candidates" :key="peopleIndex">
          <div v-if="people.eleicao_id === poll.id">
            <v-expansion-panels class="pa-1">
              <v-expansion-panel hide-actions>
                <v-expansion-panel-title class="candidate-info d-flex flex-row align-items-center justify-content-between">
                  <div><v-img class="image-candidate" src="./img/foto_colaborador/favicon.png"></v-img></div>
                  <div class="nome">{{ people.name }}</div>
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
                        <div class="text-capitalize p-3 bg-success">Registrar voto para: {{ people.name }}</div>

                        <v-card-text class="bg-light text-h4 pa-5">
                          <NfcReader @nfcData="(nfcData) => validadeVote(nfcData, people)" />
                        </v-card-text>
                      </v-card>
                    </v-dialog>
                  </v-card-text>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </div>
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
      totalVotes: [],
      polls: [],
    };
  },

  mounted() {
    this.getCandidates();
    this.voteRanking();
    this.getPolls();
  },

  methods: {
    getCandidates() {
      axios
        .get(`http://${ip}:3070/get-candidates`)
        .then((response) => {
          this.candidates = response.data;
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    },

    getPolls() {
      axios
        .get(`http://${ip}:3070/get-polls`)
        .then((response) => {
          this.polls = response.data[0];
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
        .post(`http://${ip}:3070/post-vote`, vote)
        .then(() => {
          this.$refs.alert.mostrarAlerta("success", "done_outline", "Sucesso", `Voto Computado para: ${choice.name}`);
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta("danger", "warning", "Erro", "Erro ao computar Voto!");
          console.error("Error:", error);
        });
    },

    validadeVote(data, choice) {
      this.choiceVote = choice;
      axios
        .get(`http://${ip}:3070/validate-vote`, { params: { userRfid: data } })
        .then((response) => {
          this.postVote(response.data, choice);
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta("warning", "report", "Erro!", error.response.data);
          console.error("Error:", error);
        });
    },

    voteRanking() {
      axios
        .get(`http://${ip}:3070/get-votes`)
        .then((response) => {
          this.totalVotes = response.data.result;
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
  height: 100%;
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
  justify-content: center;
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
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.ranking {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Arial", sans-serif;
}

.ranking h3 {
  text-align: center;
  color: #333;
  font-size: 1.75rem;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.ranking h3 .material-icons {
  color: #ffd700;
  font-size: 2rem;
}

.result-ranking {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.vote-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 15px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vote-item {
  margin: 0;
  color: #555;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.vote-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vote-item .votes {
  display: flex;
  align-items: center;
  gap: 5px;
}

.vote-item .material-icons {
  color: #2196f3;
  font-size: 1.25rem;
}

.no-results {
  text-align: center;
  color: #777;
  font-style: italic;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.no-results .material-icons {
  color: #777;
  font-size: 1.5rem;
}
</style>
