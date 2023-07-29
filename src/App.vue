<script setup></script>

<template>
    <div>
      <!-- Contenido de la página de inicio de sesión (Login.vue) -->
      <router-view></router-view>
    </div>
  </template>

<script>
export default {
  name: 'App',
  created() {
    // Redirige a la página de inicio de sesión al iniciar la aplicación
    this.$router.push({ name: 'login' });
  }
};
</script>

<style scoped></style>
