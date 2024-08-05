<template>
  <div class="d-flex flex-column align-items-center justify-content-center">
    <h3>Nível de Diesel - DASS Santo Estêvão</h3>
    <div class="container-diesel d-flex flex-column align-items-center justify-content-center">
      <div class="info-diesel">
        <div>
          <h5 :style="{ color: currentColor }">Nível atual: {{ currentNivel.nivel }}ml</h5>
        </div>
        <div><v-img src="./img/aplicacoes/nivelDiesel.png" class="custom-svg"></v-img></div>
      </div>
      <!-- <div v-else><h5>Esperando Conexão...</h5></div> -->

      <v-container class="gauge text-center">
        <v-progress-circular :model-value="progressValue()" :rotate="180" :size="300" :width="70" :color="currentColor">
          <span>{{ currentNivel.nivel }} ml</span>
        </v-progress-circular>
        <p class="pt-3">Ultima atualização: {{ formattedDate }}</p>
      </v-container>
    </div>
  </div>
</template>

<script>
import ip from "../ip";

export default {
  name: "NivelDiesel",
  data() {
    return {
      currentNivel: 0,
      socket: null,
      min: 0,
      max: 218.0,
      currentColor: "",
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
.gauge {
  margin: 1rem;
  font-size: 25px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.gauge:hover {
  border-radius: 40px;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.container-diesel {
  padding: 15px;
}

.custom-svg {
  height: 60px;
}

.info-diesel {
  display: grid;
  grid-template-columns: 200px 100px;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  padding: 10px;
  width: auto;
  height: 80px;
  margin-bottom: 20px;
}
</style>
