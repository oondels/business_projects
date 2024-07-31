<template>
  <div class="main">
    <h2>Realize a votação dentre essas pessoas</h2>

    <div class="choices">
      <v-expansion-panels class="pa-4" variant="popout">
        <v-expansion-panel v-for="(people, peopleIndex) in candidates" :key="peopleIndex" hide-actions>
          <v-expansion-panel-title class="candidate-info">
            <div class="nome">{{ people.nome }}</div>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="bg-light">
            <v-card-text>
              <v-dialog transition="dialog-bottom-transition" width="auto">
                <template v-slot:activator="{ props: activatorProps }">
                  <div class="info-candidate d-flex flex-column justify-content-center align-items-center">
                    <div>
                      <h3>Informações</h3>
                    </div>
                    <div class="d-flex flex-column justify-content-center align-items-center">
                      <p>Gerente: {{ people.gerente }}</p>
                      <p>Setor:{{ people.nome_setor }}</p>
                      <v-btn color="success" v-bind="activatorProps" text="Votar"></v-btn>
                    </div>
                  </div>
                </template>

                <template v-slot:default="{ isActive }">
                  <v-card>
                    <div class="text-capitalize p-3 bg-success">Registrar voto para: {{ people.nome }}</div>

                    <v-card-text class="bg-light text-h4 pa-5">
                      <NfcReader @nfcData="(nfcData) => validadeVote(nfcData, people)" />

                      <v-card-actions class="justify-end">
                        <v-btn style="opacity: 0" text="enviar" @click="isActive.value = false"></v-btn>
                      </v-card-actions>
                    </v-card-text>
                  </v-card>
                </template>
              </v-dialog>
            </v-card-text>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import ip from "../ip";
import Alert from "./components/Alert.vue";
import NfcReader from "./components/NfcReader.vue";

export default {
  name: "VotacaoPessoa",
  components: { NfcReader, Alert },

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
          this.$refs.alert.mostrarAlerta("warning", "report", "Erro", error.response.data);
          console.error("Error:", error);
        });
    },
  },
};
</script>

<style>
/* .info-candidate {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
} */

/* @media (max-width: 768px) {
  .candidate-info {
    grid-template-columns: 1fr;
  }
} */
</style>
