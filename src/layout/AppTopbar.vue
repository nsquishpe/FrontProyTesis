<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';

const { layoutConfig, onMenuToggle } = useLayout();

const user = ref(null);
const showMessage = ref(null);
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

onMounted(() => {
    bindOutsideClickListener();
    user.value = localStorage.getItem('user');
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return `demo/images/login/Logo.png`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
    showMessage.value = true;
    setTimeout(() => {
        showMessage.value  = false;
    }, 3000);
};
const onTopBarMenuButton2 = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};
const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

const onLogoutClick = () => {
  localStorage.clear();
  router.push('/auth/login');
};

</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton2()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <div class="usuario-container">
                <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                    <i class="pi pi-user"></i>
                    <span class="etiqueta-usuario">{{ user }}</span>
                </button>
                <!-- Mensaje que se muestra al hacer clic en el botón -->
                <div v-if="showMessage" class="mensaje">
                    <label><strong>   {{ user }}</strong></label>
                </div>
            </div>
            <button @click="onLogoutClick()" class="p-link layout-topbar-button">
                <i class="pi pi-power-off"></i>
                <span>Cerrar Sesión</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>