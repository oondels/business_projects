<template>
  <div class="cadastro-eleicao">
    <h4 class="d-flex flex-column align-items-center justify-content-center pb-4">Cadastro de Eleição para Votação</h4>
    <v-sheet max-width="500" height="auto">
      <div class="p-4">
        <v-form ref="form">
          <v-text-field
            density="compact"
            variant="outlined"
            hide-details="auto"
            v-model="poll.name"
            :rules="ruleName"
            label="Name"
            required
            class="mb-4"
          ></v-text-field>

          <div class="date-pickers d-flex flex-column align-items-center justify-content-center">
            <label for="dateofbirth">Data de Início</label>
            <v-text-field
              class="input"
              :rules="ruleMinDate"
              :min="minDate"
              type="date"
              name="startDate"
              id="startDate"
              v-model="poll.startDate"
              density="compact"
              variant="outlined"
              hide-details="auto"
            />

            <label for="dateofbirth">Data de Fim</label>
            <v-text-field
              density="compact"
              variant="outlined"
              hide-details="auto"
              :rules="ruleMinDate"
              :min="minDate"
              type="date"
              name="endDate"
              id="endDate"
              v-model="poll.endDate"
            />
          </div>

          <div class="d-flex justify-content-center flex-column pb-5">
            <v-btn class="mt-4" color="success" @click="validate"> Cadastrar </v-btn>

            <v-btn class="mt-4" color="error" @click="resetForm"> Reset Form </v-btn>
          </div>
        </v-form>
      </div>
    </v-sheet>
  </div>
  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import ip from "../../ip";
import Alert from "./Alert.vue";

export default {
  name: "CadastroEleicao",
  components: {
    Alert,
  },
  data() {
    return {
      poll: {
        name: "",
        startDate: "",
        endDate: "",
      },
      minDate: "",
      ruleMinDate: [
        (date) => {
          if (!date || date < this.minDate) {
            return "Selecione uma Data incial Válida";
          }
          return true;
        },
      ],
      ruleName: [
        (name) => {
          if (!name) {
            return "Nome deve ser preenchido!";
          }
          return true;
        },
      ],
    };
  },
  mounted() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    this.minDate = `${yyyy}-${mm}-${dd}`;
  },
  methods: {
    validate() {
      if (!this.poll.startDate || !this.poll.endDate || !this.poll.name) {
        return this.$refs.alert.mostrarAlerta("danger", "bi bi-exclamations", "Erro", "Todos os campos são obrigatórios");
      }

      if (this.poll.startDate < this.minDate || this.poll.endDate < this.minDate) {
        return this.$refs.alert.mostrarAlerta(
          "danger",
          "bi bi-exclamations",
          "Erro",
          "As datas devem ser posterior a data atual"
        );
      }

      if (this.poll.startDate > this.poll.endDate) {
        return this.$refs.alert.mostrarAlerta(
          "danger",
          "bi bi-exclamations",
          "Erro",
          "Data de término deve ser posterior à data de início."
        );
      }

      this.registerPoll();
    },

    resetForm() {
      this.$refs.form.reset();
    },

    registerPoll() {
      axios
        .post(`http://${ip}:3051/register-polling`, this.poll)
        .then((response) => {
          this.$refs.alert.mostrarAlerta("success", "bi bi-exclamations", "Sucesso", response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
          this.$refs.alert.mostrarAlerta("success", "bi bi-exclamations", "Erro", error);
        });
      this.$refs.form.reset();
      this.poll.startDate = "";
      this.poll.endDate = "";
    },
  },
};
</script>

<style>
.input {
  border-radius: 5px;
  background-color: #fff;
  padding: 10px;
  padding: 3px 5px;
}
</style>
