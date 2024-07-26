<template>
    <section class="col-12 row container-fluid py-2 ">
        <card-point v-for="indice in 30" :key="indice" :indice="indice" :modelos="modelos" />
    </section>
</template>

<script>
import axios from 'axios';
import ip from '../ip.js';
import CardPoint from './components/CardPoint';

export default {
    name: "Point",

    data() {
        return {
            modelos: []
        }
    },

    components: {
        CardPoint
    },

    mounted() {
        this.buscaModelos()
    },

    methods: {
        buscaModelos() {
            axios
                .get(`http://${ip}:3046/buscaModelos`)
                .then((response) => this.modelos = response.data)
                .catch((error) => console.error("Erro ao trazer modelos: ", error))
        },
    },

    beforeMount() {
        this.$store.state.showNavbar = false;
        this.$store.state.showSidenav = false;
        this.$store.state.showFooter = false;
        this.$store.state.isTransparent = "bg-white";
    },
}
</script>