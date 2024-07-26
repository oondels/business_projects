<template>
  <div class="card">
    <div class="card-header pb-0 p-3">
      <div v-if="verificaPermissao()" class="border-bottom mb-2 pb-2 text-center">
        <v-dialog max-width="800">
          <template v-slot:activator="{ props: activatorProps }">
            <i v-bind="activatorProps" class="material-icons-round cursor-pointer fs-2 text-lg me-1" @click="overlay = !overlay"
              aria-hidden="true">add</i>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Auditoria dos ferramentais">
              <form @submit.prevent="salvaAuditoria">
                <div class="col-12 position-sticky fixed-top border insercao-informacao">
                  <v-select class="col-12" v-model="form.gerenteSelecionado" @update:modelValue="buscaSetores"
                    label="Gerente" :items="gerentes" autofocus></v-select>
                  <v-select class="col-12" :disabled="disabledSetores" label="Setor" :items="form.setores"
                    v-model="form.setorSelecionado"></v-select>
                  <v-text-field class="col-12" type="number" :disabled="disabledSetores" label="Célula"
                    v-model="form.celula"></v-text-field>
                </div>

                <v-list>
                  <template v-for="(criterio, index) in criterios" :key="criterio.id_criterios">
                    <div class="categoria container"
                      v-if="index === 0 || criterio.categoria !== criterios[index - 1].categoria">
                      <h5 class="text-white m-0">{{ criterio.categoria }}</h5>
                    </div>
                    <v-list-item class="bg-color-success">
                      <div>
                        <h6>{{ criterio.avaliacao }}</h6>
                        <v-radio-group v-model="form[criterio.id_criterios]">
                          <v-radio :class="{ 'selected-option': form[criterio.id_criterios] === 'sim' }"
                            class="pergunta col-12 border mb-1 rounded" color="green" label="Sim"
                            @click="calculaPontuacaoTotal(criterio, 'sim', Number(criterio.peso), criterio.id_criterios, Number(criterio.peso_parcial), criterio.categoria)"
                            :value="'sim'"></v-radio>
                          <v-radio :class="{ 'selected-option': form[criterio.id_criterios] === 'nao' }"
                            class="pergunta col-12 border mb-1 rounded" color="red" label="Não"
                            @click="calculaPontuacaoTotal(criterio, 'nao', Number(criterio.peso), criterio.id_criterios, Number(criterio.peso_parcial), criterio.categoria)"
                            :value="'nao'"></v-radio>
                        </v-radio-group>
                        <v-textarea v-if="criterio.exibirObservacao" placeholder="Insira a observação"
                          v-model="form[criterio.id_criterios + '_observacao']" cols="85" rows="2"></v-textarea>
                      </div>
                    </v-list-item>
                  </template>
                </v-list>

                <v-card-actions class="position-fixed fixed-bottom">
                  <v-spacer></v-spacer>
                  <v-btn color="danger" text="Fechar" variant="flat" @click="isActive.value = false"></v-btn>
                  <v-btn color="success" text="Salvar" variant="flat" type="submit"></v-btn>
                </v-card-actions>
              </form>
            </v-card>
          </template>
        </v-dialog>
      </div>
      <h6 class="mb-2 text-center">Células</h6>
      <div class="col-12 row p-0 m-0">
        <v-select label="Mês" type="text" class="col-6 px-1" v-model="filtroData"
          @update:modelValue="enviaFiltroAuditoria(filtroGerente, filtroData)"
          :items="['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']"></v-select>
        <v-select label="Gerente" class="col-6 px-1" :items="gerentesAuditados" v-model="filtroGerente"
          @update:modelValue="enviaFiltroAuditoria(filtroGerente, filtroData)"></v-select>
      </div>
    </div>
    <div class="card-body p-3 mb-0">
      <ul class="ulAuditoria list-group list-style-none overflow-auto" style="height: 90vh;" v-if="auditorias"
        ref="auditoriaList" @scroll="checkEndOfList">
        <li v-for="auditoria in auditorias" :key="auditoria.id">
          <v-dialog max-width="800">
            <template v-slot:activator="{ props: activatorProps }">
              <div v-bind="activatorProps" :class="estiloAvaliacao(auditoria.pontuacao)"
                class="listaAuditoria list-group-item border-2 d-flex justify-content-between px-2 mb-2 rounded">
                <div class="d-flex flex-column">
                  <h6 class="mb-1 text-dark font-weight-bold text-sm">{{ auditoria.celula }}</h6>
                  <span class="text-xs">
                    {{ auditoria.gerente.split(" ")[0] + " " + auditoria.gerente.split(" ").pop() }}
                  </span>
                </div>
                <div class="d-flex align-items-center text-sm">
                  <div class="d-flex flex-column">
                    <strong>Pontuação: {{ auditoria.pontuacao ? auditoria.pontuacao + '%' : ' N/A' }}</strong>
                    <span class="text-xs">Realização: {{ auditoria.createdate.split("T")[0] }}</span>
                  </div>
                  <button class="btn btn-link text-dark text-sm mb-0 px-0 ms-4">
                    <i class="fas fa-file-pdf text-lg me-1" aria-hidden="true"></i>
                  </button>

                </div>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Histórico de avaliação">
                <ul class="list-unstyled col-12 row position-sticky fixed-top border insercao-informacao">
                  <li class="col-6 text-center">{{ `Celula: ${auditoria.celula}` }}</li>
                  <li class="col-6 text-center">{{ `Pontuação: ${auditoria.pontuacao}` }}</li>
                </ul>

                <v-list>
                  <template v-for="(historico, index) in auditoria.criterio" :key="index">
                    <v-list-item class="mt-3 d-flex flex-row"
                      v-if="index === 0 || historico.categoria !== auditoria.criterio[index - 1].categoria">
                      <h5 class="flex-grow-1 mb-0 px-2">{{ historico.categoria }}</h5>
                      <h6 class="px-2 text-white border border-danger rounded-0 rounded-bottom"
                        :class="estiloPesoParcial(somaPesoPorCategoria(auditoria, historico.categoria))"> {{
                          'Aproveitamento: ' + somaPesoPorCategoria(auditoria, historico.categoria) }}%</h6>
                    </v-list-item>

                    <v-list-item class="mb-3">
                      <h6 :class="historico.opcaoSelecionada === 'sim' ? 'bg-success rounded' : 'bg-danger rounded-top'"
                        class="text-white mb-0 px-2">{{ historico.avaliacao }}</h6>
                      <h6 v-if="historico.observacao !== null"
                        class="px-2 text-dark border border-danger rounded-0 rounded-bottom">{{ historico.observacao
                        }}</h6>
                    </v-list-item>
                  </template>
                </v-list>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="danger" text="Fechar" variant="text" @click="isActive.value = false"></v-btn>
                </v-card-actions>
              </v-card>

            </template>
          </v-dialog>
        </li>
      </ul>
    </div>
  </div>

  <v-dialog v-model="dialogShown" max-width="400">
    <v-card :color="corAlerta" dark>
      <v-card-title class="headline">
        <i :class="iconeAlerta"></i>
        {{ tituloAlerta }}
      </v-card-title>
      <v-card-text>
        {{ mensagemAlerta }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="dialogShown = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import axios from "axios";
import { VList, VListItem } from "vuetify/components";
import VueJwtDecode from 'vue-jwt-decode';
import ip from '../../ip.js';

export default {
  isActive: false,
  name: "listagem-setor",
  emits: ['atualizar-informacao', 'inserir-filtro', 'paginacao'],
  props: {
    auditorias: Array,
    criterios: Array,
  },
  components: {
    VList, VListItem,
  },
  setup() {
    return {
      gerentes: [],
      setores: [],
      objetos: [],
      disabledSetores: true,

      filtroAtivado: '',
      paginaAtual: 1,
      tamanhoPagina: 10,
      carregandoMais: false
    }
  },
  data() {
    return {
      dialogShown: false,
      corAlerta: '',
      iconeAlerta: '',
      tituloAlerta: '',
      mensagemAlerta: '',
      gerentesAuditados: [],

      filtroGerente: '',
      filtroData: '',

      pontos: {
        sensos: 0,
        andon: 0,
        fluxo: 0,
        gestao: 0,
        kaizen: 0,
        kanban: 0,
        pop: 0,
        qualidade: 0,
        taktTime: 0,
        tpm: 0,
      },

      form: {
        gerenteSelecionado: null,
        setorSelecionado: null,
        celula: null,
        pontuacao: 0,
      },
      opcaoSelecionada: null,
      exibirObservacao: false,
      rules: [
        value => !!value || 'Obrigatório',
        value => (value && value !== '') || 'O campo está vazio',
      ],
    }
  },
  mounted() {
    this.buscaGerentesAuditados(),
      axios
        .get(`http://${ip}:3049/buscaNomesGerentes`)
        .then(response => {
          this.gerentes = response.data
        })
        .catch(error => {
          console.error('Erro ao buscar os gerentes: ', error);
        });
  },

  methods: {
    checkEndOfList() {
      const element = this.$refs.auditoriaList;

      if (element.scrollTop + element.clientHeight >= element.scrollHeight) {
        this.$emit('paginacao', this.filtroAtivado, this.paginaAtual, this.tamanhoPagina, this.carregandoMais);
      }
    },

    enviaFiltroAuditoria(gerente, data) {
      this.filtroAtivado = gerente;
      this.$emit('inserir-filtro', gerente, data);
    },

    somaPesoPorCategoria(auditoria, categoria) {
      if (!auditoria || !categoria) return 0;

      const somaPorCategoria = {};
      auditoria.criterio.forEach((historico) => {
        if (historico.categoria === categoria) {
          if (!somaPorCategoria[categoria]) {
            somaPorCategoria[categoria] = 0;
          }
          somaPorCategoria[categoria] += historico.pesoParcial;
        }
      });
      return somaPorCategoria[categoria] || 0;
    },

    estiloPesoParcial(pontuacao) {
      let ruim = 'bg-danger';
      let regular = 'bg-warning';
      let bom = 'bg-success';

      if (pontuacao < 70) {
        return ruim;
      } else if (pontuacao >= 70 && pontuacao <= 90) {
        return regular;
      } else if (pontuacao >= 90) {
        return bom;
      }
    },

    estiloAvaliacao(pontuacao) {
      let ruim = 'border-danger';
      let regular = 'border-warning';
      let bom = 'border-success';

      if (pontuacao < 70) {
        return ruim;
      } else if (pontuacao >= 70 && pontuacao <= 90) {
        return regular;
      } else if (pontuacao >= 90) {
        return bom;
      }
    },

    decodeJwt() {
      let token = sessionStorage.getItem('token');
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    verificaPermissao() {
      if (this.decodeJwt()) {
        if (this.decodeJwt().setor === "AUTOMACAO" || this.decodeJwt().setor === "MELHORIA CONTINUA") {
          return true;
        } else {
          return false;
        }
      }
    },

    mostrarAlerta(cor, icone, titulo, mensagem) {
      this.corAlerta = cor;
      this.iconeAlerta = icone;
      this.tituloAlerta = titulo;
      this.mensagemAlerta = mensagem;
      this.dialogShown = true;
      this.isActive = false;
      return;
    },

    calculaPontuacaoTotal(criterio, valor, peso, id) {
      criterio.opcaoSelecionada = valor;
      criterio.exibirObservacao = valor === 'nao';

      if (valor === 'sim') {
        const existeObjeto = this.objetos.some(objeto => objeto.id === id);
        if (!existeObjeto) {
          this.objetos.push({
            id: id,
            peso: peso,
          });
        }
      } else if (valor === 'nao') {
        const index = this.objetos.findIndex(objeto => objeto.id === id);
        if (index !== - 1) {
          this.objetos.splice(index, 1);
        }
      }
    },

    buscaGerentesAuditados() {
      axios
        .get(`http://${ip}:3049/buscaGerentesAuditados`)
        .then(response => {
          this.gerentesAuditados = response.data
        })
        .catch(error => {
          console.error('Erro ao buscar gerentes auditados: ', error);
        })
    },

    buscaSetores() {
      if (this.form.gerenteSelecionado !== null) {
        axios
          .get(`http://${ip}:3049/buscaSetores`, { params: { gerente: this.form.gerenteSelecionado } })
          .then(response => {
            this.form.setores = response.data;
            this.disabledSetores = false;
          })
          .catch(error => {
            console.error('Erro ao trazer os nomes dos setores: ', error);
          });
      }
    },

    salvaAuditoria() {
      let auditorias = [];

      if (!this.form.gerenteSelecionado || !this.form.setorSelecionado || !this.form.celula || !this.pontuacao || !this.decodeJwt()) {
        this.mostrarAlerta('warning', 'fas fa-exclamation', 'Atenção', 'Dados obrigatórios não foram preenchidos ou você não está autenticado')
      }

      this.criterios.forEach(criterio => {

        let auditoria = {
          avaliacao: criterio.avaliacao,
          opcaoSelecionada: this.form[criterio.id_criterios],
          observacao: this.form[criterio.id_criterios + '_observacao'] || null,
          pesoParcial: this.form[criterio.id_criterios] === 'sim' ? criterio.peso_parcial : 0,
          categoria: criterio.categoria,
        };
        auditorias.push(auditoria);

      });

      let auditoriasJSONB = JSON.stringify(auditorias);

      this.form.pontuacao = 0;
      for (let i = 0; i < this.objetos.length; i++) {
        this.form.pontuacao += this.objetos[i].peso
      }

      axios.post(`http://${ip}:3049/salvaAuditoria`, {
        gerente: this.form.gerenteSelecionado,
        setor: this.form.setorSelecionado,
        celula: this.form.celula,
        criterio: auditoriasJSONB,
        pontuacao: this.form.pontuacao.toFixed(2),
        usuario_auditor: this.decodeJwt().usuario,
        matricula_auditor: this.decodeJwt().matricula
      })
        .then((response) => {
          if (response.status === 200) {
            this.mostrarAlerta('success', 'fas fa-thumbs-up', 'Sucesso', 'Auditoria salva com sucesso');
            this.form = {};

            this.$emit('atualizar-informacao');
          } else {
            this.mostrarAlerta('danger', 'fas fa-thumbs-down', 'Erro', 'Erro ao salvar auditoria');
          }
        })
        .catch((error) => {
          console.error('Erro ao salvar auditoria: ', error);
        })
    },
  }
}
</script>

<style>
.insercao-informacao {
  background-color: #fff;
}

.categoria {
  background-color: #344767;
  color: #fff;
}

.ulAuditoria {
  list-style: none;
}

.listaAuditoria:hover {
  border: 1px solid #344767;
  cursor: pointer;
}

.pergunta label {
  width: 100%;
  padding: 0;
  margin: 0;
}

.selected-option {
  border-radius: 3px;
  background-color: #3A416F;
  color: #fff;
}

.selected-option label {
  width: 100%;
  padding: 0;
  margin: 0;
}
</style>
