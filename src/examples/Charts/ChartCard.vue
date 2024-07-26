<!-- <template>
  <div class="card">
    <div class="card-header" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <div :id="chartId" class="ct-chart"></div>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Card from './Card.vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  chartType: {
    type: String,
    default: 'Line' // Line | Pie | Bar
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  },
  chartData: {
    type: Object,
    default: () => ({
      labels: [],
      series: []
    })
  },
  responsiveOptions: [Object, Array]
});

const chartId = ref(`div_${Date.now().toString()}_${Math.random().toString(36).substring(2)}`);
let $Chartist = null;
let chart = null;

const initChart = () => {
  const chartIdQuery = `#${chartId.value}`;
  chart = $Chartist[props.chartType](chartIdQuery, props.chartData, props.chartOptions, props.responsiveOptions);
  emit('initialized', chart);

  if (props.chartType === 'Line') {
    animateLineChart();
  }
  if (props.chartType === 'Bar') {
    animateBarChart();
  }
};

const animateLineChart = () => {
  let seq = 0;
  const durations = 500;
  const delays = 80;
  chart.on('draw', (data) => {
    if (data.type === 'line' || data.type === 'area') {
      data.element.animate({
        d: {
          begin: 600,
          dur: 700,
          from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
          to: data.path.clone().stringify(),
          easing: $Chartist.Svg.Easing.easeOutQuint
        }
      });
    } else if (data.type === 'point') {
      seq++;
      data.element.animate({
        opacity: {
          begin: seq * delays,
          dur: durations,
          from: 0,
          to: 1,
          easing: 'ease'
        }
      });
    }
  });
  seq = 0;
};

const animateBarChart = () => {
  let seq = 0;
  const durations = 500;
  const delays = 80;
  chart.on('draw', (data) => {
    if (data.type === 'bar') {
      seq++;
      data.element.animate({
        opacity: {
          begin: seq * delays,
          dur: durations,
          from: 0,
          to: 1,
          easing: 'ease'
        }
      });
    }
  });
};

onMounted(async () => {
  const Chartist = await import('chartist');
  $Chartist = Chartist.default || Chartist;
  initChart();
});
</script>

<style>
/* Adicione o estilo conforme necessário */
</style> -->