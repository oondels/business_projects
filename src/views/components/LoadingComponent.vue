<template>
  <div class="loading">
    <v-progress-circular
      :size="size"
      :width="width"
      indeterminate
      :color="color"
    ></v-progress-circular>
  </div>
</template>

<script>
export default {
  name: "LoadingComponent",

  props: {
    size: {
      type: String,
      default: "100",
    },
    width: {
      type: String,
      default: "10",
    },
    color: {
      type: String,
      default: "primary",
    },
  },
};
</script>

<style scoped></style>
