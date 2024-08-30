<template>
  <div class="container-diesel">
    <h3 class="text-center mb-8">Acompanhamento Diesel - DASS Santo Estêvão</h3>
    <section :class="gridClass" class="grid">
      <div class="sidebar-diesel item-grid">
        <v-expansion-panels variant="popout" class="pa-0">
          <v-expansion-panel>
            <v-expansion-panel-title class="d-flex flex-row align-items-center justify-content-between">
              Abastecimentos
            </v-expansion-panel-title>
            <v-expansion-panel-text class="bg-light">
              <div class="diesel-supply" v-if="supplies.length > 0">
                <p class="text-center">Hisórico</p>
                <ul>
                  <li v-for="(supply, supplyId) in supplies" :key="supplyId">
                    <b class="text-primary">{{ supply.quantidade }} ml</b> <br />
                    {{ formattedDate(supply.data_abastecimento) }}
                  </li>
                </ul>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="d-flex flex-row align-items-center justify-content-between">
              Ultimas medições
            </v-expansion-panel-title>
            <v-expansion-panel-text class="bg-light">
              <div class="diesel-supply" v-if="lastLevels.length > 0">
                <p class="text-center">Medições</p>
                <ul>
                  <li v-for="(level, levelId) in lastLevels" :key="levelId">
                    <b class="text-primary">{{ level.nivel }} ml</b> <br />
                    {{ formattedDate(level.data_medicao) }}
                  </li>
                </ul>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <div class="info-diesel col-lg-5 col-md-6 col-sm-6 mt-lg-0 mt-4">
        <mini-statistics-card
          :title="{ text: `Nível Atual: ${currentNivel.nivel} ml` }"
          :icon="{
            name: 'oil_barrel',
            color: 'text-white',
            background: 'success',
          }"
        />
        <GraficosDiesel />
      </div>

      <div class="content">
        <v-container class="item-grid gauge">
          <v-progress-circular :model-value="progressValue()" :rotate="180" :size="300" :width="70" :color="currentColor">
            <span>{{ currentNivel.nivel }} ml</span>
          </v-progress-circular>
          <p class="pt-3">Última atualização: {{ formattedDate(currentNivel.data_medicao) }}</p>
        </v-container>
      </div>

      <div class="item-grid alerts">
        <i v-if="this.alerts.length > 0" @click="showAlerts" class="material-icons-round">notifications_active</i>
        <div v-for="(alert, alertIndex) in alerts" :key="alertIndex">
          <div v-if="buttonNotification" class="alert">
            <button @click="sendEmail">{{ alert }}</button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import ip from "../ip";
import Alert from "./components/Alert.vue";
import MiniStatisticsCard from "./components/MiniStatisticsCard.vue";
import GraficosDiesel from "./components/manutencao/GraficosDiesel.vue";

export default {
  name: "NivelDiesel",
  components: {
    MiniStatisticsCard,
    Alert,
    GraficosDiesel,
  },

  data() {
    return {
      currentNivel: 0,
      socket: null,
      min: 0,
      max: 218.0,
      currentColor: "",
      alerts: [],
      buttonNotification: false,
      supplies: [],
      lastLevels: [],
    };
  },

  mounted() {
    this.setupWebSocket();
    this.getSupplies();
  },

  computed: {
    gridClass() {
      return {
        "grid-with-alerts": this.buttonNotification,
        "grid-no-alerts": !this.buttonNotification,
      };
    },
  },

  methods: {
    setupWebSocket() {
      this.socket = new WebSocket(`ws://${ip}:2399`);

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.currentNivel = data[0];
        this.lastLevels = data.slice(-5);
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

        if (this.alerts.length == 0) {
          this.alerts.push("Necessita Abastecimento!");
        }
      } else if (percentage > 40 && percentage <= 75) {
        this.alerts = [];
        this.currentColor = "blue";
      } else if (percentage > 75 && percentage <= 100) {
        this.alerts = [];
        this.currentColor = "green";
      }

      return percentage;
    },

    formattedDate(dateFormate) {
      const date = new Date(dateFormate);
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
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

    showAlerts() {
      if (!this.buttonNotification) {
        return (this.buttonNotification = true);
      }
      return (this.buttonNotification = false);
    },

    getSupplies() {
      axios
        .get(`http://${ip}:2399/get-supplies`)
        .then((response) => {
          this.supplies = response.data.response;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    sendEmail() {
      console.log("Email enviado");
      this.$refs.alert.mostrarAlerta("success", "mark_email_read", "Sucesso", `Email Enviado com Solicitação de Compra!`);
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
  margin-bottom: 40px;
}

.grid {
  display: grid;
  grid-template-areas:
    "sidebar-diesel info-diesel alerts"
    "sidebar-diesel content alerts";
  gap: 20px;
}

.grid-with-alerts {
  grid-template-columns: 270px auto 180px;
}

.grid-no-alerts {
  grid-template-columns: 300px auto 0;
}

.sidebar-diesel {
  grid-area: sidebar-diesel;
  background-color: #34495e;
  color: white;
  font-size: 15px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.item-grid {
  border-radius: 1.2rem;
  box-shadow: 0 2rem 3rem rgba(68, 71, 90, 0.18);
  cursor: pointer;
  transition: all 0.3s ease;
}

.item-grid:hover {
  box-shadow: none;
}

.gauge {
  grid-area: content;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #ffffff;
}

.alerts {
  grid-area: alerts;
  background-color: transparent;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 10px;
  align-items: center;
}

.grid-no-alerts .alerts {
  max-height: 0;
  transition: all 0.5s ease;
}

.grid-with-alerts .alerts {
  max-height: 500px;
  background-color: #e74c3c;
}

.diesel-supply {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-diesel .v-expansion-panel-text__wrapper {
  padding: 2px;
}

.diesel-supply p {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.diesel-supply ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.diesel-supply li {
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  color: #555;
}

.diesel-supply li:last-child {
  margin-bottom: 0;
}

@keyframes alertAnimation {
  0%,
  100% {
    transform: scale(1);
    color: rgb(0, 0, 0);
  }
  50% {
    transform: scale(1.2);
    color: rgb(255, 217, 0);
  }
}

.alerts i.material-icons-round {
  font-size: 40px;
  align-self: center;
  margin-bottom: 10px;
  background-color: red;
  color: black;
  padding: 15px;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 30px;
  animation: alertAnimation 1s infinite;
}

.grid-with-alerts .alerts i.material-icons-round {
  margin-right: 0;
}

.alerts .alert {
  margin-top: 10px;
}

.alert {
  background-color: transparent;
  border-radius: 4px;
  padding: 10px 20px;
  margin: 5px 0;
  width: 200px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.alert button {
  background-color: rgb(255, 217, 0);
  color: #333;
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
}

.alert button:hover {
  transform: scale(1.06);
}

@media (max-width: 768px) {
  .grid {
    grid-template-areas:
      "alerts"
      "info-diesel"
      "content"
      "sidebar-diesel";
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .sidebar {
    flex-direction: row;
    justify-content: space-around;
    padding: 10px 0;
  }

  .grid-no-alerts .alerts {
    margin-bottom: 60px;
  }

  .alert {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container-diesel {
    padding: 10px;
  }

  .alert {
    padding: 8px 10px;
  }
}
</style>
