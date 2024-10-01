<template>
  <div class="container-charts" id="apex-chart">
    <div class="text-center mb-5 model-title">
      <h5 class="text-white">{{ titlePage }}</h5>
    </div>

    <div class="chart mb-6">
      <div class="chart-title d-flex justify-content-center">
        <i class="material-symbols-outlined pr-3">
          {{ iconChart }}
        </i>
        <h5 class="text-center">{{ titleChart }}</h5>
      </div>
      <ApexCharts
        type="line"
        height="370"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>
  </div>
</template>

<script>
import ApexCharts from "vue3-apexcharts";

export default {
  props: {
    chartData: {
      type: Object,
      required: true,
    },

    titlePage: {
      type: String,
      default: "Gráfico de Dados",
    },

    titleChart: {
      type: String,
      default: "Dados",
    },

    iconChart: {
      type: String,
      default: "monitoring",
    },
  },

  components: {
    ApexCharts,
  },

  methods: {},

  data() {
    return {};
  },
};
</script>

<style scoped>
.chart {
  background-color: #f5f5f5;
  box-shadow:
    0 8px 6px rgba(0, 0, 0, 0.1),
    0 2px 3px rgba(0, 0, 0, 0.08);
  border-radius: 15px;
  padding: 15px;
}

.model-title {
  background-color: rgb(0, 0, 0);
  box-shadow:
    0 8px 6px rgba(0, 0, 0, 0.1),
    0 2px 3px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 5px;
}
</style>
