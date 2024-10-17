<template>
  <div class="title-aplicacoes">
    <h6 class="mb-4">Aplicações</h6>
  </div>

  <div
    class="apps mt-3 d-flex flex-row justify-content-center align-items-center"
  >
    <div class="col-4 mb-4 aplication-card">
      <router-link to="/refeitorio" class="refeitorio">
        <span class="aplication-title-card">
          Refeitório
          <img :src="refeitorioImg" />
        </span>
      </router-link>
    </div>

    <div v-if="permission()" class="col-4 mb-4 aplication-card">
      <router-link to="/cadastro-usuarios" class="cadastro-usuarios">
        <span class="aplication-title-card">
          Cadastro De Usuários
          <img :src="cadastroUserImg" />
        </span>
      </router-link>
    </div>
  </div>
</template>

<script>
import VueJwtDecode from "vue-jwt-decode";
import cadastroUserImg from "../../public/img/aplicacoes/cadastro-user.png";
import refeitorioImg from "../../public/img/aplicacoes/refeitorio.png";

// import axios from "axios";
// import ip from "../ip";

export default {
  name: "tables",
  components: {},

  mounted() {},

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    permission() {
      if (this.decodeJwt()) {
        if (
          this.decodeJwt().usuario === "TAINEY.JUNIOR" ||
          this.decodeJwt().usuario === "HENDRIUS.SANTANA"
        ) {
          return true;
        }
      }
      return false;
    },
  },

  data() {
    return {
      onHover: false,
      refeitorioImg: refeitorioImg,
      cadastroUserImg: cadastroUserImg,
    };
  },
};
</script>

<style>
.title-aplicacoes h6 {
  font-size: 30px;
  text-align: center;
  border-bottom: 1px solid red;
}

.title-aplicacoes {
  width: 100%;
  display: flex;
  justify-content: center;
}

.aplication-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.aplication-card a {
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  background-color: #fff;
  border-radius: 20px;
  width: 235px;
  height: 95px;
  padding: 10px;
  transition:
    background-color 0.8s ease,
    color 0.8s ease;
}

.aplication-card a span {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.aplication-card a:hover {
  box-shadow: rgba(100, 100, 111, 0.1) 0px 7px 29px 0px;
  background-color: rgba(255, 255, 255, 0.8);
  color: red;
}

.aplication-card img {
  margin-left: 5px;
  max-width: 80px;
  transition: transform 0.5s ease;
}

.aplication-card .hover img {
  transform: scale(1.05);
}

.dark {
  background-color: rgb(47, 47, 47) !important;
}

@media screen and (max-width: 880px) {
  .aplication-card a {
    font-size: 14px;
    max-width: 190px;
    height: 80px;
    padding: 5px;
  }

  .aplication-card img {
    width: 60px;
  }
}

@media screen and (max-width: 600px) {
  .aplication-card a {
    font-size: 12px;
    max-width: 120px;
    height: 90px;
  }

  .aplication-card img {
    width: 50px;
  }

  .aplication-card a span {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
}
</style>
