<template>
  <v-dialog max-width="1000">
    <template v-slot:activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="help-icon cursor-pointer">
        <v-btn @click="dieselCharts" color="success" variant="flat" append-icon="mdi-open-in-new">Gráficos</v-btn>
      </div>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <h4>Gráficos Diesel</h4>
        </v-card-title>

        <v-card-item>
          <ApexChartManutencao />
        </v-card-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="danger" text="Fechar" variant="tonal" @click="isActive.value = false"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import axios from "axios";
import ip from "../../../ip";
import ApexChartManutencao from "./ApexChartManutencao.vue";

export default {
  name: "GraficosDiesel",

  components: {
    ApexChartManutencao,
  },

  methods: {
    dieselCharts() {
      axios
        .get(`http://${ip}:2399/chart-data`)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Erro ao se comunicar com o servidor: ", error);
        });
    },
  },
};
</script>

<style></style>
