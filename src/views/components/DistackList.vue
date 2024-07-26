<template>
  <div class="card">

    <div class="card-header pb-0">
      <div class="row">
        <div class="col-lg-6 col-7">
          <h6>{{ title }}</h6>
          <p class="text-sm mb-0" v-html="description"></p>
        </div>
      </div>
    </div>
    <div class="card-body px-0 pb-2">
      <div class="table-responsive">
        <table class="table align-items-center mb-0">
          <thead>
            <tr>
              <th v-for="(heading, index) of headers" :key="index" :class="[
                index === 1 ? 'ps-2' : '',
                index >= 2 ? 'text-center' : '',
              ]" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                {{ heading }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(
                {
                  title,
                  turno,
                  data,
                  nome,
                  situacao_atual,
                },
                  index
              ) of projects" :key="index">
              <v-bottom-sheet inset>
                <template v-slot:activator="{ props }">
                  <td v-bind="props">
                    <div class="d-flex px-2 py-1">
                      <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-xs">{{ title }}</h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="avatar-group mt-2 text-center">
                      <h6 class="text-xs">{{ turno }}</h6>
                    </div>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> {{ data }} </span>
                  </td>
                  <td class="align-middle">
                    <span class="text-xs font-weight-bold"> {{ nome }} </span>
                  </td>
                </template>

                <v-card :title="title" :text="situacao_atual[0] + situacao_atual.substring(1).toLowerCase()"></v-card>
              </v-bottom-sheet>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "distack-list",
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    headers: {
      type: Array,
      required: true,
    },
    projects: {
      type: Array,
      required: true,
      logo: String,
      title: String,
      turno: Number,
      data: String,
      nome: String,
    },
  },
};
</script>
