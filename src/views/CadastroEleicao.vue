<template>
  <div class="main">
    <h4 class="d-flex flex-column align-items-center justify-content-center pb-4">Cadastro de Eleição para Votação</h4>
    <v-sheet class="mx-auto" width="350">
      <v-form ref="form">
        <v-text-field v-model="name" :counter="10" :rules="rules" label="Name" required></v-text-field>

        <div class="date-pickers d-flex flex-column align-items-center justify-content-center">
          <label for="dateofbirth">Data de Início</label>
          <input type="date" name="startDate" id="startDate" v-model="startDate" />

          <label for="dateofbirth">Data de Fim</label>
          <input type="date" name="endDate" id="endDate" v-model="endDate" />
        </div>

        <div class="d-flex flex-column">
          <v-btn class="mt-4" color="success" block @click="logData"> Validate </v-btn>

          <v-btn class="mt-2" color="error" block> Reset Form </v-btn>
        </div>
      </v-form>
    </v-sheet>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      startDate: "",
      endDate: "",
      rules: [
        (value) => {
          if (value) return true;
          return "Este Campo é Obrigatório!";
        },
      ],
    };
  },
  methods: {
    logData() {
      console.log(this.startDate, this.endDate, this.name);
    },
  },
};
</script>

<style>
label {
  display: block;
}
input {
  border: 1px solid #c4c4c4;
  border-radius: 5px;
  background-color: #fff;
  padding: 3px 5px;
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.1);
  width: 190px;
}
</style>
