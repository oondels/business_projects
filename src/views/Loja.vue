<template>
  <div class="d-flex justify-content-center align-items-center flex-column">
    <div
      class="loja-container d-flex justify-content-center align-items-center flex-column"
    >
      <div
        class="title d-flex justify-content-center align-items-center flex-row"
      >
        <h3>Solicitação de Itens - DASS</h3>
        <!-- <img src="../../public/img/icons/loja.png" /> -->
      </div>

      <div class="wrapper">
        <h5>Escolha o almoxarifado desejado</h5>
        <v-combobox
          :items="['Manutenção', 'Aviamento']"
          clearable
          label="Almoxarifado"
        >
        </v-combobox>

        <div class="search">
          <v-text-field label="Pesquisar"></v-text-field>
        </div>
      </div>

      <i class="material-symbols-outlined"> shopping_cart </i>
    </div>
  </div>
</template>

<script>
export default {
  data() {},
};
</script>

<style scoped>
body {
  font-family: "Poppins", sans-serif;
  background-color: #f4f4f9;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loja-container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  width: 100%;
  text-align: center;
}

.title img {
  width: 100px;
  margin: 30px;
}

.wrapper {
  max-width: 700px;
}

h3 {
  color: #333;
  margin-bottom: 10px;
}

h5 {
  color: #555;
  margin-bottom: 20px;
}

select {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
  background-color: #f9f9f9;
  transition: border-color 0.3s ease;
}

select:focus {
  border-color: #00aaff;
}

.search input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search input:focus {
  border-color: #00aaff;
}

.material-symbols-outlined {
  font-size: 32px;
  color: #00aaff;
  cursor: pointer;
  margin-top: 20px;
  transition: transform 0.3s ease;
}

.material-symbols-outlined:hover {
  transform: scale(1.1);
}
</style>
