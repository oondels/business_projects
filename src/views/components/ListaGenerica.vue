<template>
  <div class="col-12 row">
    <div class="col-6" v-for="(item, index) in items" :key="index">
      <h6 class="col-12 fs-5 fw-bold text-black">
        {{ item.title }}
      </h6>

      <a v-for="(acesso, indexAcessos) in item.acessos" :key="indexAcessos" class="col-12" :href="acesso.link">
        <div class="col-12 mb-2 text-white text-center rounded bg-dark">{{ acesso.nome }}</div>
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
