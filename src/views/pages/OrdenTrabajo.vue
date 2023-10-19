<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import OrdTrabCabService from '@/service/OrdTrabCabService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const clientes = ref(null);
const products = ref(null);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);

const ordTrabCabService = new OrdTrabCabService();

const cliente = ref({
    anio: '',
    cliCodigo: '',
    cliNombrec: '',
    cliNombre: '',
    cliRucide: '',
    cliDireccion1: '',
    cliTelefono1: '',
    cliCorreo: '',
    cliSaldo: 0,
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

// Función para refrescar los clientes con el año seleccionado
const RefreshClientes = async () => {
    const selectedYearValue = selectedYear.value.value; 
    clientes.value = await ordTrabCabService.getOrdenes(selectedYearValue);
};

const confirmDeleteProduct = (editCliente) => {
    cliente.value = editCliente;
    deleteProductDialog.value = true;
    console.log(cliente);
};

const deleteProduct = async () => {
    try {
        const newCliente = {
            anio: '2023',
            cliCodigo: cliente.value.cliCodigo,
            cliNombrec: cliente.value.cliNombre,
            cliNombre: cliente.value.cliNombre,
            cliRucide: cliente.value.cliCodigo,
            cliDireccion1: cliente.value.cliDireccion1,
            cliTelefono1: cliente.value.cliTelefono1,
            cliCorreo: cliente.value.cliCorreo,
            cliSaldo: 0,
        };

    const response = await clienteService.deleteCliente(newCliente);
    console.warn(response);

    if (response == true) {
      toast.add({ severity: 'success', summary: 'Exitoso', detail: 'Cliente Eliminado', life: 3000 });
      // Actualiza la lista de clientes 
      RefreshClientes();
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Cliente con ventas registradas, no puede eliminarse.', life: 3000 });
    }
    deleteProductDialog.value = false;
    product.value = {};
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el cliente', life: 3000 });
  }
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-2">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Nuevo" icon="pi pi-plus" class="p-button-success mr-4" @click="openNew" />
                            <label for="dropdownYears" style="font-weight: bold;color: black;font-size: 1.05em;" class="mr-1">PERIODO: </label>
                            <Dropdown v-model="selectedYear" :options="dropdownYears" optionLabel="label" placeholder="Año" @focus="RefreshClientes" disabled />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-secondary" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="clientes"
                    :dataKey="cliente.ordNumero"
                    :paginator="true"
                    :rows="5"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
                    responsiveLayout="scroll"
                >
                    <template #header >
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" >
                            <h5 class="m-0">Administrar Órdenes de Trabajo</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column field="ordNumero" header="Número" :sortable="false" headerStyle="width:16%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.ordNumero }}
                        </template>
                    </Column>
                    <Column field="cliNombre" header="Nombre" :sortable="true" headerStyle="width:16%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.cliNombre }}
                        </template>
                    </Column>
                    <Column field="cliCodigo" header="Código" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.cliCodigo }}
                        </template>
                    </Column>
                    <Column field="ordFecha" header="Fecha" :sortable="false" headerStyle="width:16%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.ordFecha }}
                        </template>
                    </Column>
                    <Column field="ordPlaca" header="Placa" :sortable="false" headerStyle="width:18%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.ordPlaca }}
                        </template>
                    </Column>
                    <Column field="vehmarmodCodigo" header="Marca" :sortable="false" headerStyle="width:18%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.vehmarmodCodigo }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button mr-2" @click="editCliente(slotProps.data)" style="background-color: #2e78ba;"/>
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="cliente"
                            >¿Está seguro de que desea eliminar el registro <b>{{ cliente.cliNombre }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Si" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
