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

        <v-card-item class="detailed-chart">
          <ApexChart :options="options" :series="series" />
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
      options: {
        chart: {
          id: "",
        },

        xaxis: {
          categories: [],
        },
      },

      series: [
        {
          name: "Produtivo",
          data: [],
        },
      ],
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
          console.log(response.data.productHistory);
          this.options.xaxis.categories = [];
          this.series[0].data = [];

          response.data.productHistory.forEach((item) => {
            let date = new Date(item.data);

            let day = String(date.getDate()).padStart(2, "0");
            let month = String(date.getMonth() + 1).padStart(2, "0");
            let year = date.getFullYear();
            let formatted = `${day}/${month}/${year}`;

            let hours = String(date.getHours()).padStart(2, "0");
            let minutes = String(date.getMinutes()).padStart(2, "0");
            let seconds = String(date.getSeconds()).padStart(2, "0");
            let formattedTime = `${hours}:${minutes}:${seconds}`;

            let formattedDate = formatted + "-" + formattedTime;

            this.options.chart.id = item.produto;
            this.options.xaxis.categories.push(formattedDate);
            this.series[0].data.push(item.produtivo);
          });
        })
        .catch((error) => {
          console.error("Error ao se comunicar com servidor: ", error);
        });
    },
  },
};
</script>

<style scoped></style>
