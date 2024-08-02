<template>
  <div class="cadastro-candidate">
    <h4 class="d-flex flex-column align-items-center justify-content-center pb-4">Cadastro de Candidato para Votação</h4>
    <v-sheet max-width="500" height="auto">
      <v-form ref="form">
        <div class="p-4">
          <div class="label-name">
            <i class="material-icons-round opacity-10 fs-4"> group_add </i>
            <label class="text-center" for="matricula">Insira a matricula do candidato:</label>
          </div>
          <div>
            <v-text-field
              density="compact"
              variant="outlined"
              hide-details="auto"
              label="Matrícula"
              type="number"
              name="matricula"
              id="matricula"
              v-model.number="candidateData.registration"
            />

            <div class="polls-container">
              <select
                v-for="(poll, pollIndex) in polls"
                :key="pollIndex"
                v-model="candidateData.poll"
                class="styled-select"
                name="polls"
                id="polls"
              >
                <option value="" disabled selected>Escolha uma Competiçao</option>
                <option :value="poll.id">{{ poll.name }}</option>
              </select>
            </div>
          </div>
          <v-btn class="mt-4" color="success" block @click="registerCandidate"> Cadastrar </v-btn>
        </div>
      </v-form>
    </v-sheet>
  </div>
  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import ip from "../../ip";
import Alert from "./Alert.vue";

export default {
  name: "CadastroCandidate",
  components: {
    Alert,
  },

  data() {
    return {
      polls: [],

      candidateData: {
        registration: null,
        poll: "",
      },
    };
  },

  mounted() {
    this.getPolls();
  },

  methods: {
    getPolls() {
      axios
        .get(`http://${ip}:3043/get-polls`)
        .then((response) => {
          this.polls = response.data;
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    },

    registerCandidate() {
      if (!this.candidateData.registration || !this.candidateData.poll) {
        return this.$refs.alert.mostrarAlerta("warning", "warning", "Aviso!", `Preencha todos os campos!`);
      }

      if (typeof this.candidateData.registration !== "number") {
        return this.$refs.alert.mostrarAlerta("warning", "warning", "Aviso!", `Apenas dados de Matrícula (Somente Números)`);
      }

      axios
        .post(`http://${ip}:3043/register-candidate`, this.candidateData)
        .then((response) => {
          this.$refs.alert.mostrarAlerta("success", "done_outline", "Sucesso", response.data.message);
        })
        .catch((error) => {
          console.error("Erro ao Cadastrar Colaborador(a):", error.response.data.message);
          this.$refs.alert.mostrarAlerta("danger", "report", "Erro!", error.response.data.message);
        });
    },
  },
};
</script>

<style>
.label-name {
  display: grid;
  grid-template-columns: 0.5fr 6fr;
  color: rgb(50, 167, 59);
}

.polls-container {
  margin-top: 10px;
}

.styled-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
  font-size: 16px;
  color: rgb(50, 167, 59);
}

.styled-select option {
  padding: 10px;
}
</style>
