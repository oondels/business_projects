<template>
  <div class="container-charts" id="apex-chart">
    <div class="text-center mb-5 model-title">
      <h5 class="text-white">Modelo: {{ model }} - Produto: {{ title }}</h5>
    </div>
    <div class="chart mb-6">
      <div class="chart-title d-flex justify-content-center">
        <i class="material-symbols-outlined pr-3"> currency_exchange </i>
        <h5 class="text-center">Totais: Gasto(R$) X Consumo(Kg)</h5>
      </div>
      <ApexCharts type="line" height="370" :options="totalRsKg.options" :series="totalRsKg.series" />
    </div>
    <hr />
    <div class="chart mb-6">
      <div class="chart-title d-flex justify-content-center">
        <i class="material-symbols-outlined pr-3"> currency_exchange </i>
        <h5 class="text-center">Consumo em R$</h5>
      </div>

      <ApexCharts type="line" height="370" :options="totalRs.options" :series="totalRs.series" />
    </div>
    <hr />
    <div class="chart mb-6">
      <div class="chart-title d-flex justify-content-center">
        <i class="material-symbols-outlined pr-3"> weight </i>
        <h5 class="text-center">Consumo em Kg</h5>
      </div>

      <ApexCharts type="line" height="370" :options="totalKg.options" :series="totalKg.series" />
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
  },

  components: {
    ApexCharts,
  },

  mounted() {
    this.test();
  },

  methods: {
    test() {
      console.log(this.chartData.totalRsKg);
    },
  },

  data() {
    return {
      totalRsKg: this.chartData.totalRsKg,
      totalRs: this.chartData.totalRs,
      totalKg: this.chartData.totalKg,
      title: this.chartData.chartTitle,
      model: this.chartData.chartModel,
    };
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
