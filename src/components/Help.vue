<template>
  <v-dialog max-width="600">
    <template v-slot:activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="help-icon cursor-pointer">
        <i class="material-icons-round"> info </i>
      </div>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="text-center border-bottom position-sticky fixed-top border-bottom bg-white">
          <h3>{{ title }}</h3>
        </v-card-title>

        <v-card-item class="help-message">
          <p>{{ message }}</p>
        </v-card-item>
        <hr />

        <v-card-actions class="help-message">
          <v-spacer></v-spacer>

          <v-btn color="danger" text="Fechar" variant="tonal" @click="isActive.value = false"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
export default {
  name: "Help",
  props: {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.help-message {
  background-color: #fff9c4;
}

hr {
  background-color: black;
  margin: 0;
}

.help-icon i {
  font-size: 30px;
  animation: helPulse 1s ease infinite;
}

@keyframes helPulse {
  0% {
    scale: 1;
  }
  50% {
    scale: 1.1;
  }
  100% {
    scale: 1;
  }
}
</style>
