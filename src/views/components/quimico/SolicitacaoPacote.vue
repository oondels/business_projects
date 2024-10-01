<template>
  <v-dialog class="solicitacao-pacote" max-width="800">
    <template v-slot:activator="{ props: activatorProps }">
      <div
        v-bind="activatorProps"
        class="col-lg-4 col-md-6 col-sm-6 mt-lg-0 mt-4 cursor-pointer"
      >
        <mini-statistics-card
          :title="{ text: 'Solicitação de pacote' }"
          :icon="{
            name: 'dataset',
            color: 'text-white',
            background: 'primary',
          }"
        />
      </div>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title
          class="text-center border-bottom position-sticky fixed-top border-bottom bg-white"
        >
          <h3>Solicitação de químico</h3>
        </v-card-title>
        <v-card-item>
          <div class="cel-fab-turno mb-3 col-12 row">
            <h5>Turno e Célula</h5>

            <div class="col-6">
              <v-text-field
                type="number"
                label="Célula"
                v-model="dadoslocal.celula"
              ></v-text-field>
            </div>

            <div class="col-6">
              <v-select
                :items="['Fábrica 1', 'Fábrica 2', 'Fábrica 3']"
                label="Fábrica"
                clearable
                v-model="dadoslocal.fabrica"
              ></v-select>
            </div>

            <div class="col-6">
              <v-select
                label="Turno"
                v-model="dadoslocal.turno"
                :items="['TURNO A', 'TURNO B']"
                clearable
              ></v-select>
            </div>
          </div>

          <div
            class="col-12 row mb-3 solicitacoes"
            v-for="(solicitacao, solicitacaoIndex) in solicitacoes"
            :key="solicitacaoIndex"
          >
            <div class="d-flex justify-content-between text-danger delete">
              <h5 class="text-center mt-2">
                Solicitação {{ solicitacaoIndex + 1 }}
              </h5>
              <i
                class="material-symbols-outlined pr-3"
                role="button"
                @click="removeSolicitacao(solicitacaoIndex)"
                v-if="solicitacaoIndex > 0"
              >
                delete
              </i>
            </div>
            <div class="col-6">
              <v-select
                :items="processos"
                label="Processo"
                v-model="solicitacao.processo"
                @update:modelValue="
                  buscaModelosCadastrados(solicitacao.processo)
                "
              ></v-select>
            </div>

            <div class="col-6">
              <v-combobox
                :disabled="!dadosModelo[solicitacaoIndex]"
                :items="dadosModelo[solicitacaoIndex]"
                outlined
                item-title="modelo"
                item-value="id"
                label="Modelo"
                v-model="dadosModeloSelecionado[solicitacaoIndex]"
                @update:modelValue="
                  atribuiModeloSolicitacao(
                    dadosModeloSelecionado,
                    solicitacaoIndex
                  )
                "
              >
              </v-combobox>
            </div>

            <div class="col-6">
              <v-text-field
                type="number"
                label="Produção prevista"
                v-model="solicitacao.producao"
              ></v-text-field>
            </div>
          </div>

          <div class="matricula-nome">
            <div class="mt-3 col-12">
              <v-text-field
                type="number"
                :rules="matriculaRules"
                label="Matrícula"
                v-model="dadosUser.matricula"
                @keyup="buscaSolicitante(dadosUser.matricula)"
              ></v-text-field>
            </div>

            <div class="col-12">
              <v-text-field
                type="text"
                disabled
                label="Nome"
                v-model="dadosUser.nome"
              ></v-text-field>
            </div>
          </div>
        </v-card-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="dadosModelo.length > 0"
            color="primary"
            variant="tonal"
            append-icon="mdi-plus-circle"
            @click="addSolicitacao"
          >
            Adicionar
          </v-btn>
          <v-btn
            color="danger"
            text="Fechar"
            variant="tonal"
            @click="
              zerarSolicitacao();
              isActive.value = false;
            "
          ></v-btn>
          <v-btn
            color="success"
            text="Salvar"
            @click="salvarSolicitacao"
            variant="tonal"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <alert ref="alert" />
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../../../ip";
import Alert from "../Alert.vue";
import MiniStatisticsCard from "../MiniStatisticsCard.vue";

export default {
  name: "solicitacao-pacote",
  emits: ["atualiza-solicitacoes"],
  data() {
    return {
      solicitacoes: [
        {
          modelo: "",
          idModelo: 0,
          producao: "",
          processo: "",
          marca: "",
        },
      ],
      dadoslocal: {
        celula: null,
        turno: "",
        fabrica: "",
      },

      dadosUser: {
        nome: "",
        matricula: "",
        gerente: "",
      },

      matriculaRules: [
        (value) => (value && value.length >= 7) || "Insira seu crachá completo",
      ],

      processos: [],
      dadosModelo: [],
      dadosModeloSelecionado: [],
    };
  },
  mounted() {
    this.buscaProcessosCadastrados();
  },
  methods: {
    ativaSocket() {
      this.$emit("atualiza-solicitacoes", "pacote");
    },

    addSolicitacao() {
      this.solicitacoes.push({
        modelo: "",
        idModelo: 0,
        producao: "",
        processo: "",
        marca: "",
      });
    },

    removeSolicitacao(index) {
      this.solicitacoes.splice(index, 1);
      this.dadosModelo.splice(index, 1);
      console.log(this.dadosModelo);
    },

    atribuiModeloSolicitacao(modeloSelecionado, index) {
      this.solicitacoes[index].modelo = modeloSelecionado[index].modelo;
      this.solicitacoes[index].idModelo = modeloSelecionado[index].id;
      this.solicitacoes[index].marca = modeloSelecionado[index].marca;
    },

    buscaModelosCadastrados(processo) {
      axios
        .get(`http://${ip}:3045/buscaModelosCadastrados`, {
          params: { processo: processo },
        })
        .then((response) => {
          this.dadosModelo.push(response.data);
          console.log(this.dadosModelo);
        })
        .catch((error) => {
          console.error("Erro ao buscar modelos cadastrados", error.response);
        });
    },

    buscaProcessosCadastrados() {
      axios
        .get(`http://${ip}:3045/buscaProcessosCadastrados`)
        .then((response) => (this.processos = response.data))
        .catch((error) =>
          console.error("Erro ao buscar modelos cadastrados", error.response)
        );
    },

    buscaSolicitante(matricula) {
      if (matricula.length === 7) {
        axios
          .get(`http://${ip}:3045/cracha`, { params: { matricula: matricula } })
          .then((response) => {
            this.dadosUser.nome = response.data[0].nome;
            this.dadosUser.gerente = response.data[0].gerente;
          })
          .catch((error) => {
            console.error("Erro ao buscar solicitante", error.response);
          });
      }
    },

    salvarSolicitacao() {
      axios
        .post(`http://${ip}:3045/salvarSolicitacaoPacote`, {
          solicitacoes: this.solicitacoes,
          local: this.dadoslocal,
          user: this.dadosUser,
        })
        .then(() => {
          this.zerarSolicitacao();
          this.$refs.alert.mostrarAlerta(
            "success",
            "done_outline",
            "Sucesso",
            "Solicitação salva com sucesso"
          );
          this.$emit("atualiza-solicitacoes", "pacote");
        })
        .catch((error) => {
          this.$refs.alert.mostrarAlerta(
            "warning",
            "warning",
            "Atenção",
            error.response.data
          );
        });
    },

    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    zerarSolicitacao() {
      this.solicitacoes = [
        {
          modelo: "",
          idModelo: 0,
          producao: "",
          processo: "",
          marca: "",
        },
      ];

      this.dadosModeloSelecionado = [];

      this.dadosUser = {
        nome: "",
        matricula: "",
        gerente: "",
      };

      this.dadoslocal = {
        celula: null,
        turno: "",
        fabrica: "",
      };

      this.dadosModelo = [];
    },
  },

  components: {
    MiniStatisticsCard,
    Alert,
  },
};
</script>

<style scoped>
.solicitacoes {
  margin-left: 1px;
  padding: 5px;
  width: 95%;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.delete i:hover {
  animation: delete 1s ease;
}

@keyframes delete {
  0% {
    transform: scale(1);
    transform: rotate(0deg);
  }
  50% {
    transform: scale(1.1);
    transform: rotate(15deg);
  }
  100% {
    transform: scale(1);
    transform: rotate(0deg);
  }
}
</style>
