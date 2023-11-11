<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Módulos',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'Clientes',
                icon: 'pi pi-fw pi-user',
                to: '/pages/crud'
            },
            {
                label: 'Ventas',
                icon: 'pi pi-fw pi-calculator',
                to: '/pages/venEncfac'
            },
            {
                label: 'Inventario',
                icon: 'pi pi-fw pi-folder',
                to: '/pages/invMaearticulo'
            },
            {
                label: 'Órdenes de Trabajo',
                icon: 'pi pi-fw pi-wrench',
                to: '/pages/ordenTrabajo'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
