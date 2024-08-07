<template>
  <div class="col-12 row">
    <div class="col-6" v-for="(item, index) in items" :key="index">
      <h6 class="col-12 fs-5 text-center mb-3">
        {{ item.title }}
      </h6>

      <a
        v-for="(acesso, indexAcessos) in item.acessos"
        :key="indexAcessos"
        class="col-12 link-wrapper"
        :href="acesso.link"
        target="_blank"
      >
        <div class="col-12 mb-2 access-link-lista-generica">{{ acesso.nome }}</div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "lista-generica",
  props: {
    items: Array,
  },
};
</script>

<style>
.access-link-lista-generica {
  background-color: #d62724;
  color: #fff;
  text-align: center;
  border-radius: 30px;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  border-radius: 0.75rem;
  box-shadow: rgba(0, 0, 0, 0.02) 0 1px 3px 0;
  transition: all 0.2s ease-in-out;
}

.access-link-lista-generica:hover {
  background-color: #ef5350;
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
  transform: translateY(-1px);
}

.link-wrapper {
  display: flex;
  justify-content: center;
}
</style>
