<template>
  <v-dialog max-width="1000">
    <template v-slot:activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="help-icon cursor-pointer">
        <v-btn @click="searchProductHistory" color="success" variant="flat" append-icon="mdi-open-in-new">Detalhar Gráfico</v-btn>
      </div>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <h3>Detalhamento de Gráfico</h3>
        </v-card-title>

        <v-card-item v-if="Object.keys(chartData).length" class="detailed-chart">
          <ApexChart :chartData="chartData" />
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
import ApexChart from "../../../examples/Charts/ApexChart.vue";
import ip from "../../../ip";

export default {
  name: "DetailedChart",

  props: {
    productData: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      chartData: {},
    };
  },

  components: {
    ApexChart,
  },

  methods: {
    searchProductHistory() {
      axios
        .get(`http://${ip}:3045/getProductHistory`, { params: this.productData })
        .then((response) => {
          this.chartData = response.data;
        })
        .catch((error) => {
          console.error("Error ao se comunicar com servidor: ", error);
        });
    },
  },
};
</script>

<style scoped></style>
