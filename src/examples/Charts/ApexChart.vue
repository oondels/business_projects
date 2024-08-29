<template>
  <div id="apex-chart">
    <ApexCharts type="line" height="370" :options="chartOptions" :series="chartSeries" />
  </div>
</template>

<script>
import ApexCharts from "vue3-apexcharts";

export default {
  props: {
    options: {
      type: Object,
      required: true,
    },

    series: {
      type: Array,
      required: true,
    },
  },

  components: {
    ApexCharts,
  },

  methods: {},

  data() {
    return {
      chartOptions: this.options,
      chartSeries: this.series,
    };
  },
};
</script>

<style scoped></style>
