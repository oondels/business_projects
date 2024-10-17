<template>
  <div class="register-container">
    <div class="register-content">
      <h3 class="text-center">Cadastro de Usuários</h3>
      <div
        class="register-info col-12 d-flex flex-column justify-content-center align-items-center"
      >
        <v-combobox
          variant="solo-filled"
          class="col-6"
          label="Unidade"
          v-model="dassUnits.selection"
          @update:modelValue="upgradeUnit"
          :items="['Vitória da Conquista', 'Itaberaba']"
          clearable
        />
        <v-text-field
          @input="getEmployee"
          :disabled="!selectedUnit"
          variant="solo-filled"
          color="success"
          class="p-1 col-6"
          label="Matrícula"
          v-model="registration"
          type="number"
        />
        <v-text-field
          variant="outlined"
          color="success"
          class="p-1 col-6"
          label="Nome"
          v-model="employeeInfo.name"
          disabled
        />

        <div
          class="col-6 d-flex flex-row justify-content-center align-items-center"
        >
          <v-text-field
            variant="outlined"
            color="success"
            class="p-1 col-3"
            label="Usuário"
            v-model="employeeInfo.user"
            disabled
          />
          <v-text-field
            variant="outlined"
            color="success"
            class="p-1 col-3"
            label="Cód. Barras"
            v-model="employeeInfo.codbarras"
          />
        </div>

        <div
          class="col-6 d-flex flex-row justify-content-center align-items-center"
        >
          <v-text-field
            variant="outlined"
            color="success"
            class="p-1 col-3"
            label="Setor"
            v-model="employeeInfo.department"
            disabled
          />
          <v-text-field
            variant="outlined"
            color="success"
            class="p-1 col-3"
            label="Gerente"
            v-model="employeeInfo.manager"
            disabled
          />
        </div>

        <div
          class="col-6 d-flex flex-row justify-content-center align-items-center"
        >
          <v-text-field
            variant="solo-filled"
            color="success"
            class="p-1 col-3"
            label="Função"
            v-model="employeeInfo.function"
          />
          <v-text-field
            variant="solo-filled"
            color="success"
            class="p-1 col-3"
            type="password"
            v-model="employeeInfo.password"
            label="Senha"
          />
        </div>

        <v-btn
          @click="regiterUser"
          class="col-6"
          color="success"
          variant="outlined"
          >Cadastrar</v-btn
        >
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

export default {
  name: "CadastroUsuarios",
  components: { Alert },

  data() {
    return {
      dassUnits: {
        "Vitória da Conquista": "VDC",
        Itaberaba: "ITB",
        Itapipoca: "ITP",
        selection: "",
      },

      selectedUnit: "",
      registration: null,
      employeeInfo: {
        registration: null,
        codbarras: null,
        name: "",
        manager: "",
        department: "",
        user: "",
        function: "",
        password: "",
      },
    };
  },

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    upgradeUnit() {
      this.selectedUnit = this.dassUnits[this.dassUnits.selection];
    },

    getEmployee() {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Você precisa fazer login!"
        );
      }

      if (!this.selectedUnit) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Atenção",
          "Selecione um Unidade Dass."
        );
      }

      if (this.registration.length === 7) {
        axios
          .get(`http://${ip}:3023/get-employee`, {
            params: {
              unidade: this.selectedUnit,
              registration: this.registration,
            },
          })
          .then((response) => {
            this.employeeInfo.name = response.data.nome;
            this.employeeInfo.manager = response.data.gerente;
            this.employeeInfo.department = response.data.nome_setor;
            this.employeeInfo.codbarras = response.data.codbarras;
            this.employeeInfo.registration = this.registration;
            this.employeeInfo.function = response.data.funcao;
            this.employeeInfo.password = "dass";
            this.employeeInfo.user = `${this.employeeInfo.name.split(" ")[0]}.${
              this.employeeInfo.name.split(" ")[
                this.employeeInfo.name.split(" ").length - 1
              ]
            }`;

            if (!response.data.codbarras) {
              this.$refs.alert.mostrarAlerta(
                "warning",
                "warning",
                "Atenção",
                "Não foi possível localizar o Cód. barras do colaborador, por favor insira no campo destinado"
              );
            }
          })
          .catch((error) => {
            console.error(
              `Erro ao consultar colaborador por matrícula, ${error}`
            );
            return this.$refs.alert.mostrarAlerta(
              "warning",
              "warning",
              "Atenção",
              error.response.data
            );
          });
      }
    },

    regiterUser() {
      axios
        .post(`http://${ip}:3023/register-user`, {
          user: this.employeeInfo,
          unidade: this.selectedUnit,
        })
        .then((response) => {
          this.registration = null;
          this.employeeInfo = {
            registration: null,
            codbarras: null,
            name: "",
            manager: "",
            department: "",
            user: "",
            function: "",
            password: "",
          };

          return this.$refs.alert.mostrarAlerta(
            "success",
            "done_outline",
            "Sucesso!",
            response.data
          );
        })
        .catch((error) => {
          console.error("Erro ao registrar usuário: ", error);
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "warning",
            "Atenção",
            error.response.data
          );
        });
    },
  },
};
</script>

<style scoped>
.register-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-content {
  background-color: rgb(255, 255, 255);
  width: 700px;
  padding: 20px;
  border-radius: 20px;
}
</style>
