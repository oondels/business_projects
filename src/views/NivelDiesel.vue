<template>
  <div class="container-diesel">
    <h3 class="text-center">Acopanhamento Diesel - DASS Santo Estêvão</h3>
    <section class="grid">
      <div class="sidebar-diesel">
        <v-expansion-panels class="pa-4">
          <v-expansion-panel>
            <v-expansion-panel-title class="candidate-info d-flex flex-row align-items-center justify-content-between">
              Histórico de Abastecimentos
            </v-expansion-panel-title>
            <v-expansion-panel-text class="bg-light"> Result 1 </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="candidate-info d-flex flex-row align-items-center justify-content-between">
              Ultimas medições
            </v-expansion-panel-title>
            <v-expansion-panel-text class="bg-light">
              <ul>
                <li>Medição 1</li>
                <li>Medição 2</li>
                <li>Medição 3</li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="candidate-info d-flex flex-row align-items-center justify-content-between">
              Requisição para Compra
            </v-expansion-panel-title>
            <v-expansion-panel-text class="bg-light"> <p>Dighitar Campo</p> </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <div class="col-lg-3 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer">
        <mini-statistics-card
          :title="{ text: 'Nível Atual' }"
          :icon="{
            name: 'oil_barrel',
            color: 'text-white',
            background: 'success',
          }"
        />
        <!-- <div class="info-card">
          <div class="icon">
            <i class="material-icons-round">oil_barrel</i>
          </div>
          <div>
            <h5 :style="{ color: currentColor }">Nível atual: {{ currentNivel.nivel }} ml</h5>
          </div>
        </div> -->
      </div>

      <div class="content">
        <v-container class="gauge">
          <v-progress-circular :model-value="progressValue()" :rotate="180" :size="300" :width="70" :color="currentColor">
            <span>{{ currentNivel.nivel }} ml</span>
          </v-progress-circular>
          <p class="pt-3">Última atualização: {{ formattedDate }}</p>
        </v-container>
      </div>
      <div class="alerts">
        <div class="alert">Alerta 1</div>
        <div class="alert">Alerta 2</div>
      </div>
    </section>
  </div>
</template>

<script>
import ip from "../ip";
import MiniStatisticsCard from "./components/MiniStatisticsCard.vue";

export default {
  name: "NivelDiesel",
  components: {
    MiniStatisticsCard,
  },

  data() {
    return {
      currentNivel: 0,
      socket: null,
      min: 0,
      max: 218.0,
      currentColor: "",
      alert: false,
    };
  },

  mounted() {
    this.setupWebSocket();
  },

  computed: {
    formattedDate() {
      const date = new Date(this.currentNivel.data_medicao);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      };
      return date.toLocaleString("pt-BR", options);
    },
  },
  methods: {
    setupWebSocket() {
      this.socket = new WebSocket(`ws://${ip}:2399`);

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.currentNivel = data;
      };

      this.socket.onopen = () => {
        console.log("Connected to WebSocket server");
      };

      this.socket.onclose = () => {
        console.log("Disconnected from WebSocket server");
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    },

    progressValue() {
      const { nivel } = this.currentNivel;
      const percentage = ((nivel - this.min) / (this.max - this.min)) * 100;

      if (percentage > 0 && percentage <= 40) {
        this.currentColor = "red";
      } else if (percentage > 40 && percentage <= 75) {
        this.currentColor = "blue";
      } else if (percentage > 75 && percentage <= 100) {
        this.currentColor = "green";
      }

      return percentage;
    },
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>

<style>
@font-face {
  font-family: "Poppins";
  src: url("@/assets/fonts/Poppins-Regular.ttf") format("truetype");
  font-style: normal;
}

.container-diesel {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.grid {
  display: grid;
  grid-template-areas:
    "sidebar-diesel info-diesel alerts"
    "sidebar-diesel content alerts";
  grid-template-columns: 200px 1fr 250px;
  gap: 20px;
}

.sidebar-diesel {
  grid-area: sidebar-diesel;
  background-color: #34495e;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 10px;
  font-size: 18px;
}

.info-diesel {
  grid-area: info-diesel;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.info-card {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.info-card .icon {
  background-color: #0d9757;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 10px;
}

.info-card .icon i {
  font-size: 24px;
}

.gauge {
  grid-area: content;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.gauge:hover,
.info-diesel:hover {
  transform: scale(1.02);
}

.alerts {
  grid-area: alerts;
  background-color: #e74c3c;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 10px;
}

.alert {
  background-color: #c0392b;
  border-radius: 4px;
  padding: 10px 20px;
  margin: 5px 0;
  width: 200px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .grid {
    grid-template-areas:
      "info-diesel"
      "content"
      "alerts"
      "sidebar-diesel";
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .sidebar {
    flex-direction: row;
    justify-content: space-around;
    padding: 10px 0;
  }

  .alert {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container-diesel {
    padding: 10px;
  }

  h3 {
    font-size: 18px;
  }

  .info-diesel,
  .content,
  .alerts {
    padding: 10px;
  }

  .alert {
    padding: 8px 10px;
  }
}
</style>
