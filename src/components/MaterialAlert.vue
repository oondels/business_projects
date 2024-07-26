<template>
  <v-dialog v-model="alertAlerta" max-width="400">
    <v-card :color="corAlerta" dark>
      <v-card-title class="headline">
        <i :class="iconeAlerta"></i>
        {{ tituloAlerta }}
      </v-card-title>
      <v-card-text>
        {{ mensagemAlerta }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="fecharAlerta">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    cor: String,
    icone: String,
    titulo: String,
    mensagem: String,
    alert: Boolean,
  },
  data() {
    return {
      corAlerta: '',
      iconeAlerta: '',
      tituloAlerta: '',
      mensagemAlerta: '',
      alertAlerta: true
    };
  },
  watch: {
    cor(newVal) {
      this.corAlerta = newVal;
    },
    icone(newVal) {
      this.iconeAlerta = newVal;
    },
    titulo(newVal) {
      this.tituloAlerta = newVal;
    },
    mensagem(newVal) {
      this.mensagemAlerta = newVal;
    },
    alert(newVal) {
      this.alertAlerta = newVal;
    }
  },
  methods: {
    fecharAlerta() {
      this.alertAlerta = false;
    }
  },
  mounted() {
    this.$emit('ready');
  }
};
</script>