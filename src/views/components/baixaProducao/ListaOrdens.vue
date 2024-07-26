<template>
    <ul class="list-group lista" v-if="produtos">
        <li class="list-group-item">
            <div class="col-12 row">
                <div class="col-3 text-center">Ordem</div>
                <div class="col-3 text-center">Data</div>
                <div class="col-3 text-center">Hora</div>
                <div class="col-3 text-center">Código</div>
            </div>
        </li>
        <li class="list-group-item mb-1 rounded"
            :class="destacaProblema(produto.ordem, produto.identificacao_antena, lista)" v-for="produto in produtos"
            :key="produto.id">
            <div class="col-12 row">
                <div class="col-3 text-center">{{ produto.ordem }}</div>
                <div class="col-3 text-center">{{ formataTempo(produto.createdate).data }}</div>
                <div class="col-3 text-center">{{ formataTempo(produto.createdate).hora }}</div>
                <div class="col-3 text-center">{{ produto.codigo }}</div>
            </div>
        </li>
    </ul>
    <div v-else>
        <p>Nenhum dado encontrado</p>
    </div>
</template>

<script>
export default {
    name: 'lista-ordens',
    props: {
        produtos: Array,
        lista: String
    },
    methods: {
        destacaProblema(ordem, identificacaoAntena, lista) {
            console.log(ordem, identificacaoAntena, lista);
            if (lista !== 'SAIDA MONTAGEM') {
                if (!ordem || (identificacaoAntena !== lista)) {
                    return 'bg-danger text-white';
                }
            }
        },

        formataTempo(tempo) {
            if (!tempo) return { data: '', hora: '' };

            let data;
            let hora;

            data = `${tempo.split("T")[0].split("-")[2]}/${tempo.split("T")[0].split("-")[1]}/${tempo.split("T")[0].split("-")[0]}`;
            hora = `${tempo.split("T")[1].split(":")[0]}:${tempo.split("T")[1].split(":")[1]}`;

            return { data, hora };
        },
    }
}
</script>

<style>
.lista {
    max-height: 300px;
    overflow-y: auto;
}
</style>