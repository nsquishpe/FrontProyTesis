<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return `/demo/images/login/Logo.png`;
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-22rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #2356a5 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Bienvenido</div>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Usuario</label>
                        <InputText id="email1" type="text" placeholder="Nombre de usuario" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="Usuidentificacion" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="Usuclave" placeholder="Contraseña" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>

                        <Button v-on:click="login" label="Ingresar" class="p-button-secondary w-full p-3 text-xl mb-3" style="margin-top: 1rem;"></Button>
                        <div v-if="showAlert" class="alert alert-danger" role="alert">
                          {{ errorMessage }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<script>
import axios from 'axios';

export default {
  name: "Login",
  data() {
    return {
      Usuidentificacion: '',
      Usuclave: '',
      showAlert: false,
      errorMessage: 'Debe completar todos los campos.',
    }
  },
  methods: {
    async login() {

      // Verificar si los campos están vacíos
      if (this.Usuidentificacion.trim() === '' || this.Usuclave.trim() === '') {
        this.showAlert = true;
      }
      else{
          let result = await axios.get(
          `http://localhost/BackProyTesis/api/SegMaeusuario?usu=${this.Usuidentificacion}&clave=${this.Usuclave}`
        )
        if (result.status == 200 && result.data == true) {
          localStorage.setItem("user-info", JSON.stringify(result.data))
          localStorage.setItem('user', this.Usuidentificacion);
          this.$router.push({ name: 'dashboard' });
        }
        else {
          this.showAlert = true;
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        }
        console.warn(result)
      }
    }
  },
  mounted() {
    let user = localStorage.getItem("user-info");
    
    if (user == "true") {
      this.$router.push({ name: 'dashboard' });
    }
  }
};
</script>






<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
.alert {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem 1.25rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}
</style>