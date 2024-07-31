<template>
  <div class="d-flex flex-column align-items-center justify-content-center">
    Aproxime o crachá no leitor!
    <v-img :aspect-ratio="1" class="pulse" :src="nfcImage" width="300"></v-img>
    <input id="nfc-input" placeholder="Insira" ref="nfcInput" type="text" v-model="nfcData" @keyup.enter="readNfcData" />
  </div>
</template>

<script>
import nfcImage from "../../../public/img/aplicacoes/nfc-image.png";

export default {
  name: "NfcReader",

  data() {
    return {
      nfcImage: nfcImage,
      nfcData: null,
    };
  },

  mounted() {
    this.$refs.nfcInput.focus();
  },

  methods: {
    readNfcData(event) {
      this.nfcData = event.target.value;
      this.$emit("nfcData", this.nfcData);
      this.nfcData = null;
    },
  },
};
</script>

<style>
#nfc-input {
  position: absolute;
  opacity: 0;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.pulse {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
</style>
