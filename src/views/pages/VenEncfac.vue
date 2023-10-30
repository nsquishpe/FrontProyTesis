<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import VenEncfacService from '@/service/VenEncfacService';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router'; // Importa useRouter de vue-router
const router = useRouter(); // Obtén el objeto router
const showTextarea = ref(false);

const clientes = ref(null);
const dt = ref(null);
const filters = ref({});
const confirmPopup = useConfirm();


const venEncfacService = new VenEncfacService();

const encfac = ref({
    encfacNumero: '',
    cliNombre: '',
    cliCodigo: '',
    cliNombre: '',
    encfacFechaemision: '',
    encfacTotal: '',
    vhcspcfPlaca: '',
});

//Select Anios
const years = ref(['2018','2019','2020', '2021', '2022', '2023']); // Lista de años como cadenas
const selectedYear =  ref({ label: '2023', value: '2023' }); // Valor por defecto del select como cadena
const dropdownYears = years.value.map(year => ({ label: year, value: year }));

onBeforeMount(() => {
    initFilters();
});

// Método para cargar los clientes cuando se enfoca en el Dropdown
onMounted(() => {
    RefreshClientes();
});

const goToVenDetfac = (anio, encfacNumero, vhcspcfPlaca) => {
  anio = anio.value; 
  // Navegar a la página VenDetfac con parámetros
  router.push({ name: 'venDetfac', params: { anio, encfacNumero, vhcspcfPlaca } });
};


// Función para refrescar los clientes con el año seleccionado
const RefreshClientes = async () => {
    const selectedYearValue = selectedYear.value.value; 
    clientes.value = await venEncfacService.modeloAuto(selectedYearValue);
    // Formatear las fechas en cada objeto dentro de clientes.value utilizando map
    clientes.value = clientes.value.map(cliente => {
        if (cliente.encfacFechaemision) {
            const fecha = new Date(cliente.encfacFechaemision);
            cliente.encfacFechaemision = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
        }
        return cliente;
    });
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2" style="text-align: center;">
                            <label for="dropdownYears" style="font-weight: bold;color: black;font-size: 1.05em;" class="mr-1">PERIODO: </label>
                            <Dropdown v-model="selectedYear" :options="dropdownYears" optionLabel="label" placeholder="Año" @focus="RefreshClientes" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-secondary" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="clientes"
                    :dataKey="encfac.encfacNumero"
                    :paginator="true"
                    :rows="5"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h4 class="noto-sans-font">
                                <i class="pi pi-fw pi-calculator mr-3" style="font-size: 1.8rem; color: #779ecb;"></i>
                                <label>Administrar Ventas</label>
                            </h4>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column field="encfacNumero" header="NÚMERO" :sortable="false" headerStyle="width:14%; min-width:10rem; ">
                        <template #body="slotProps">
                            <span class="p-column-title">Num</span>
                            {{ slotProps.data.encfacNumero }}
                        </template>
                    </Column>
                    <Column field="cliNombre" header="NOMBRE" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.cliNombre }}
                        </template>
                    </Column>
                    <Column field="cliCodigo" header="CÓDIGO" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.cliCodigo }}
                        </template>
                    </Column>
                    <Column field="vhcspcfPlaca" header="PLACA" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.vhcspcfPlaca }}
                        </template>
                    </Column>
                    <Column field="encfacFechaemision" header="FECHA" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Cod</span>
                            {{ slotProps.data.encfacFechaemision }}
                        </template>
                    </Column>
                    <Column field="encfacTotal" header="TOTAL" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">tot</span>
                            {{ formatCurrency(slotProps.data.encfacTotal) }}
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #header> VISUALIZAR </template>
                        <template #body="slotProps">
                            <ConfirmPopup></ConfirmPopup>
                            <Button icon="pi pi-search" type="button" class="p-button-rounded p-button mr-2" style="background-color: #2e78ba;" @click="goToVenDetfac(selectedYear, slotProps.data.encfacNumero, slotProps.data.vhcspcfPlaca)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
.smile-button {
    padding: 0.8rem 1.4rem;
    background-image: url('/demo/images/login/smile.png');
    background-size: 2rem 1.8rem; /* Establece el tamaño de la imagen de fondo */
    background-repeat: no-repeat; /* Evita la repetición de la imagen */
    background-position: center center; /* Centra la imagen en el botón */
}
</style>