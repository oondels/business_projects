<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <template v-slot:activator="{ props: activatorProps }">
      <v-tooltip :text="toolTip">
        <template v-slot:activator="{ props }">
          <i
            role="button"
            v-bind="Object.assign({}, activatorProps, props)"
            class="cancel-button material-symbols-outlined"
          >
            cancel
          </i>
        </template>
      </v-tooltip>
      <v-btn v-if="btn">{{ btnName }}</v-btn>
    </template>

    <v-card color="danger">
      <v-card-title>
        <i style="color: yellow" class="mdi mdi-alert pr-3"></i>
        <strong style="color: #fff">{{ titleText }}</strong>
      </v-card-title>

      <v-card-text style="color: #fff">
        <p>{{ message }}</p>
        <v-text-field
          v-model="motivoText"
          v-if="motivo"
          label="Motivo"
        ></v-text-field>
      </v-card-text>

      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn
          variant="outlined"
          @click="
            dialog = false;
            emitirEvento();
          "
        >
          {{ btnAgree }}
        </v-btn>

        <v-btn
          variant="outlined"
          color="yellow-lighten-2"
          @click="dialog = false"
        >
          {{ btnDisagree }}
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "CaixaConfirmacao",

  props: {
    titleText: {
      type: String,
      default: "Deseja Prosseguir?",
    },
    titleBtn: {
      type: String,
      default: "Cancelar",
    },
    message: {
      type: String,
      default:
        "Essa operação não pode ser revertida. Prossiga apenas se tiver certeza!",
    },
    btnAgree: {
      type: String,
      default: "Cancelar",
    },
    btnDisagree: {
      type: String,
      default: "Não Cancelar",
    },
    icon: {
      type: String,
      default: "cancel",
    },
    motivo: {
      type: Boolean,
      default: false,
    },
    btn: {
      type: Boolean,
      default: false,
    },
    btnName: {
      type: String,
      default: "Abrir",
    },
    toolTip: {
      type: String,
      default: "Cancelar",
    },
  },

  data() {
    return {
      dialog: false,
      motivoText: "",
    };
  },

  methods: {
    emitirEvento() {
      this.$emit("agreeEmit", { motivo: this.motivoText });
    },
  },
};
</script>

<style scoped>
.cancel-button {
  transition: 0.5s ease all;
}

.cancel-button:hover {
  color: red;
  transform: scale(1.2);
}
</style>
