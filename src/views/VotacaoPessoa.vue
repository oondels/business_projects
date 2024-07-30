<template>
  <div class="main">
    <h2>Realize a votação dentre essas pessoas</h2>

    <div class="choices">
      <v-expansion-panels class="pa-4" variant="popout">
        <v-expansion-panel v-for="(people, i) in peopleToVote" :key="i" hide-actions>
          <v-expansion-panel-title>
            <v-row align="center" class="spacer" no-gutters>
              <v-col cols="3" md="1" sm="2">
                <v-avatar size="60px">
                  <v-img
                    v-if="people.photo"
                    alt="Avatar"
                    src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460"
                  ></v-img>
                  <v-icon v-else :color="people.color" :icon="people.icon"></v-icon>
                </v-avatar>
              </v-col>

              <v-col class="hidden-xs-only text-left ms-2" md="3" sm="5">
                <strong v-html="people.name"></strong>
              </v-col>

              <v-col class="text-no-wrap text-left" cols="5" sm="3">
                <strong v-html="people.setor"></strong>
              </v-col>
            </v-row>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-card-text
              ><v-container>
                <v-row justify="space-around">
                  <v-col cols="12" md="6">
                    <v-dialog transition="dialog-bottom-transition" width="auto">
                      <template v-slot:activator="{ props: activatorProps }">
                        <v-btn v-bind="activatorProps" text="Votar" block></v-btn>
                      </template>

                      <template v-slot:default="{ isActive }">
                        <v-card>
                          <v-toolbar :title="'Registrar voto para ' + people.name"></v-toolbar>

                          <v-card-text class="text-h4 pa-5">
                            <NfcReader @nfcData="(nfcData) => readNfcData(nfcData, people.name)" />

                            <v-card-actions class="justify-end">
                              <v-btn style="opacity: 0" text="enviar" @click="isActive.value = false"></v-btn>
                            </v-card-actions>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-dialog>
                  </v-col>
                </v-row> </v-container
            ></v-card-text>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
  <alert ref="alert" />
</template>

<script>
import NfcReader from "./components/NfcReader.vue";
import axios from "axios";
import ip from "../ip";
import Alert from "./components/Alert.vue";

export default {
  name: "VotacaoPessoa",
  components: { NfcReader, Alert },

  data() {
    return {
      choiceVote: "",
      peopleToVote: [
        {
          photo: "https://avatars0.githubusercontent.com/u/9064066?v=4&s=460",
          name: "Maria Clara",
          setor: "Montagem",
          votes: 0,
        },
        {
          photo: "https://avatars0.githubusercontent.com/u/9064066?v=4&s=460",
          name: "Monica Leite",
          setor: "Costura",
          votes: 0,
        },
      ],
    };
  },

  methods: {
    validateUser() {},

    readNfcData(data, choice) {
      this.choiceVote = choice;
      axios
        .get(`http://${ip}:3043/post-choice`, { params: { userRfid: data } })
        .then((response) => {
          this.$refs.alert.mostrarAlerta(
            "success",
            "fas fa-exclamation-triangle",
            "Sucesso",
            `Voto Computado para o funcionário ${choice}`
          );
          console.log("Dados enviados:", response.data);
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta("warning", "fas fa-exclamation-triangle", "Erro", error.response.data);
          console.error("Error:", error);
        });
    },

    choiceEmployee(option) {
      this.peopleToVote.forEach((people) => {
        if (people.name === option) {
          people.votes += 1;
        }
      });
      console.log(this.peopleToVote);
    },
  },
};
</script>

<style></style>
