<template>
  <div class="card mb-4">
    <div class="card-header pb-0">
      <h6>Colaboradores reservantes</h6>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0 vh-50 overflow-auto">
          <thead>
            <tr>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Nome
              </th>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2"
              >
                Setor
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Reserva
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Data da reserva
              </th>
              <th class="text-secondary opacity-7"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reserva in reservasDoDia" :key="reserva.id">
              <td>
                <div class="d-flex px-2 py-1">
                  <div>
                    <soft-avatar
                      :img="''"
                      class="me-3"
                      size="sm"
                      border-radius="lg"
                      alt="user4"
                    />
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-sm">{{ reserva.nome.split(" ")[0] + " " + reserva.nome.split(" ").pop() }}</h6>
                  </div>
                </div>
              </td>
              <td>
                <p class="text-xs font-weight-bold mb-0">{{ reserva.setor }}</p>
                <p class="text-xs text-secondary mb-0">{{ reserva.gerente.split(" ")[0] + " " + reserva.gerente.split(" ").pop() }}</p>
              </td>
              <td class="align-middle text-center text-sm">
                <soft-badge color="success" variant="gradient" size="sm"
                  >{{ reserva.opcao_selecionada }}</soft-badge
                >
              </td>
              <td class="align-middle text-center">
                <span class="text-secondary text-xs font-weight-bold"
                  >{{ reserva.createdate.split("T")[0] }}</span
                >
              </td>
              <td class="align-middle">
                <a
                  href="javascript:;"
                  class="text-secondary font-weight-bold text-xs"
                  data-toggle="tooltip"
                  data-original-title="Edit user"
                  >{{ reserva.consumido }}</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: "authors-table",
  data() {
    return {

    };
  },
  props: {
    reservasDoDia: Array,
  },
  components: {

  },
};
</script>
