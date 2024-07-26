<template>
  <footer class="py-5 footer">
    <div class="container">
      <div class="row">
        <div class="mx-auto mb-4 text-center col-lg-8">
          <a href="javascript:;" target="_blank" class="mb-2 text-secondary me-xl-5 me-3 mb-sm-0">
            Dass SEST
          </a>
        </div>
      </div>
      <div class="row">
        <div class="mx-auto mt-1 text-center col-8">
          <p class="mb-0 text-secondary">
            {{ new Date().getFullYear() }} Desenvolvido por Dass SEST.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "app-footer",
};
</script>
