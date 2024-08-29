<template>
  <div id="apex-chart">
    <ApexCharts type="line" height="370" :options="chartOptions" :series="chartSeries" />
  </div>
</template>

<script>
import ApexCharts from "vue3-apexcharts";

export default {
  props: {
    data: {
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
      console.log(this.data);
    },
  },

  data() {
    return {
      chartOptions: this.data.options,
      chartSeries: this.data.series,
    };
  },
};
</script>

<style scoped></style>
