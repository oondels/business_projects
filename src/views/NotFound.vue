<template>
  <div class="page-not-found">
    <div class="message">
      <h2>Aplicativo não encontrado.</h2>
      <p>Volte para o Menu e procure outro aplicativo.</p>
    </div>
    <img src="error-404.png" alt="" />
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.page-not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.message {
  text-align: center;
}

.page-not-found img {
  width: 700px;
  text-align: center;
}

@media screen and (max-width: 850px) {
  .page-not-found img {
    max-width: 450px;
    width: auto;
  }
}

@media screen and (max-width: 450px) {
  .page-not-found img {
    max-width: 350px;
    width: auto;
  }
}
</style>
