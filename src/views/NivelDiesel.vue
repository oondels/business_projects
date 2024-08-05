<template>
  <h3>Nível de Diesel da Unidade - DASS-SEST</h3>
</template>

<script>
import axios from "axios";
import ip from "../ip";
// import VueJwtDecode from "vue-jwt-decode";

export default {
  name: "NivelDiesel",
  data() {
    return {};
  },

  mounted() {
    this.getNivelDiesel();
  },

  methods: {
    getNivelDiesel() {
      axios
        .get(`http://${ip}:2399/get-diesel`)
        .then((response) => {
          console.log(response.data.response);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
};
</script>

<style></style>
