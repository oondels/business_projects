<template>
  <div class="card mb-15">
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0 vh-50 overflow-auto">
          <thead>
            <tr>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Nome
              </th>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2"
              >
                Setor
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Hora da reserva
              </th>
              <th class="text-secondary opacity-7"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="colaborador in colaboradoresSabado"
              :key="colaborador.matricula"
            >
              <td>
                <div class="d-flex px-2 py-1">
                  <div class="me-2">
                    <input
                      type="checkbox"
                      :disabled="
                        colaborador.disponibilidade === 'Reservado'
                          ? true
                          : false
                      "
                      v-model="colaborador.selecionado"
                    />
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <p class="text-xs font-weight-bold mb-0">
                      {{ colaborador.nome }}
                    </p>
                    <p class="text-xs text-secondary mb-0">
                      {{ colaborador.matricula }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <p class="text-xs font-weight-bold mb-0">
                  {{ colaborador.nome_setor }}
                </p>
                <p class="text-xs text-secondary mb-0">
                  {{ colaborador.gerente }}
                </p>
              </td>
              <td class="align-middle text-center text-sm">
                <input
                  type="time"
                  :disabled="
                    colaborador.disponibilidade === 'Reservado' ? true : false
                  "
                  :value="
                    colaborador.hora_reserva
                      ? colaborador.hora_reserva
                      : horaReserva
                  "
                />
              </td>
              <td class="align-middle">
                <p
                  class="text-secondary font-weight-bold text-xs m-0"
                  data-toggle="tooltip"
                  data-original-title="Edit user"
                >
                  {{ colaborador.disponibilidade }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import ip from "../../ip";
import VueJwtDecode from "vue-jwt-decode";
import Alert from "./Alert.vue";

export default {
  name: "listagem-colaborador",
  emits: ["colaboradores-selecionados", "atualizar-informacao"],
  components: {
    Alert,
  },
  data() {
    return {
      colaboradoresSelecionados: [],
    };
  },
  props: {
    colaboradoresSabado: Array,
    gerenteSelecionado: String,
    gerenteDestino: String,
    setorSelecionado: String,
    setorDestino: String,
    dataReserva: String,
    horaReserva: String,
    celula: Number,
  },
  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    emitirSalvarColaboradores() {
      this.$emit("salvar-colaboradores");
    },

    salvarColaboradoresSelecionados() {
      this.colaboradoresSelecionados = [];

      this.colaboradoresSabado.forEach((colaborador) => {
        if (colaborador.selecionado) {
          this.colaboradoresSelecionados.push(colaborador);
        }
      });

      this.salvarReservaSabado(this.colaboradoresSelecionados);
    },

    salvarReservaSabado(colaboradores) {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "fas fa-exclamation",
          "Atenção",
          "Faça login para realizar a reserva"
        );
      }

      axios
        .post(`http://${ip}:3048/salvarReservaSabado`, {
          colaboradores: JSON.stringify(colaboradores),
          gerenteSelecionado: this.gerenteSelecionado,
          gerenteDestino: this.gerenteDestino,
          setorSelecionado: this.setorSelecionado,
          setorDestino: this.setorDestino,
          dataReserva: this.dataReserva,
          horaReserva: this.horaReserva,
          usuarioCreate: this.decodeJwt().usuario,
          unidade: this.decodeJwt().unidade,
        })
        .then((response) => {
          if (response.status === 200) {
            this.$refs.alert.mostrarAlerta(
              "success",
              "fas fa-thumbs-up",
              "Sucesso",
              "Reserva salva com sucesso"
            );

            this.$emit("atualizar-informacao");
          }
        })
        .catch((error) => {
          if (error.response.status === 422) {
            this.$refs.alert.mostrarAlerta(
              "warning",
              "fas fa-exclamation",
              "Atenção",
              "Dados obrigatórios não foram preenchidos"
            );
          } else {
            this.$refs.alert.mostrarAlerta(
              "danger",
              "fas fa-thumbs-down",
              "Erro",
              "Erro ao salvar reserva"
            );
            console.error("Erro ao salvar reserva para o sábado: ", error);
          }
        });
    },
  },
};
</script>
