<template>
  <div class="shopping-cart">
    <h2>Your Cart</h2>
    <div v-if="cartItems.length">
      <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
        <!-- <p>{{ item.name }} - {{ item.price | currency }}</p> -->
        <button @click="removeItem(index)">Remove</button>
      </div>
      <!-- <p>Total: {{ total | currency }}</p> -->
    </div>
    <div v-else>
      <p>Your cart is empty</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ShoppingCart",
  props: ["cartItems"],
  computed: {
    total() {
      return this.cartItems.reduce((sum, item) => sum + item.price, 0);
    },
  },
  methods: {
    removeItem(index) {
      this.$emit("remove-item", index);
    },
  },
};
</script>

<style scoped>
.shopping-cart {
  border: 1px solid #ddd;
  padding: 20px;
  width: 300px;
}
.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}
button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
}
</style>
