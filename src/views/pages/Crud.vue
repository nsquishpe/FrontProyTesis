<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import ProductService from '@/service/ProductService';
import ClienteService from '@/service/ClienteService';
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

let campoCodigoNoEditable = false; // Declaración de la variable aquí

const productService = new ProductService();

const clienteService = new ClienteService();
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
    clientes.value = await clienteService.getClientes(selectedYearValue);
};

const openNew = () => {
    campoCodigoNoEditable = false;
    cliente.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const saveCliente = async () => {
  submitted.value = true;
  if (cliente.value.cliCodigo && cliente.value.cliNombre && cliente.value.cliTelefono1 && cliente.value.cliCorreo && cliente.value.cliDireccion1) {
    try {
      
        const selectedYearValue = selectedYear.value.value; 
        console.warn(selectedYearValue);
        console.warn(cliente.value.cliCodigo);
        const existingCliente = await clienteService.getClienteById(selectedYearValue, cliente.value.cliCodigo);

      if (existingCliente) {
        // Si el cliente existe, estamos editando
        const updatedCliente = {
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

        // Realiza la llamada PUT a tu API para actualizar el cliente existente
        await clienteService.updateCliente(updatedCliente);
        toast.add({ severity: 'success', summary: 'Exitoso', detail: 'Cliente Actualizado', life: 3000 });
      } else {
        // Si el cliente no existe, estamos creando un nuevo cliente
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

        // Realiza la llamada POST a tu API con el objeto del nuevo cliente
        const response = await clienteService.createCliente(newCliente);
        console.log('Cliente creado con ID:', response.id);
        toast.add({ severity: 'success', summary: 'Exitoso', detail: 'Cliente Creado', life: 3000 });
      }

      // Actualiza la lista de clientes (si es necesario)
      RefreshClientes();

      // Limpia el formulario y cierra el diálogo
      productDialog.value = false;
      cliente.value = {}; // Se restablece el objeto cliente para evitar problemas al abrir el diálogo nuevamente.
      submitted.value = false;
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el cliente', life: 3000 });
    }
  }
};


const editCliente = (editCliente) => {
    cliente.value = { ...editCliente };
    campoCodigoNoEditable = true; // Deshabilitar el campo de código del cliente
    console.log(cliente);
    productDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
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
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Nuevo" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Eliminar" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="clientes"
                    v-model:selection="selectedProducts"
                    dataKey="id"
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
                            <h5 class="m-0">Administrar Clientes</h5>
                            <Dropdown v-model="selectedYear" :options="dropdownYears" optionLabel="label" placeholder="Año" @focus="RefreshClientes" />
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="cliCodigo" header="Código" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.cliCodigo }}
                        </template>
                    </Column>
                    <Column field="cliNombre" header="Nombre" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.cliNombre }}
                        </template>
                    </Column>
                    <Column field="cliTelefono1" header="Teléfono" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.cliTelefono1 }}
                        </template>
                    </Column>
                    <Column field="cliCorreo" header="Correo" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.cliCorreo }}
                        </template>
                    </Column>
                    <Column field="cliDireccion1" header="Dirección" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.cliDireccion1 }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editCliente(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Detalle Cliente" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Código</label>
                        <span class="p-input-icon-left">
                            <i class="pi pi-id-card" />
                            <InputText v-model.trim="cliente.cliCodigo" required="true" autofocus :class="{ 'p-invalid': submitted && !cliente.cliCodigo }" :readonly="campoCodigoNoEditable" />
                            <small class="p-invalid" v-if="submitted && !cliente.cliCodigo">se requiere código </small>
                        </span>
                    </div>
                    <div class="field">
                            <label for="name">Nombre</label>
                            <span class="p-input-icon-left">
                                <i class="pi pi-user" />
                                <InputText v-model.trim="cliente.cliNombre" required="true" autofocus :class="{ 'p-invalid': submitted && !cliente.cliNombre }" />
                                <small class="p-invalid" v-if="submitted && !cliente.cliNombre">se requiere nombre </small>
                            </span>
                        </div>
                    <div class="field">
                        <label for="phone">Teléfono</label>
                        <span class="p-input-icon-left">
                            <i class="pi pi-phone" />
                            <InputText v-model.trim="cliente.cliTelefono1" required="true" autofocus :class="{ 'p-invalid': submitted && !cliente.cliTelefono1 }" />
                            <small class="p-invalid" v-if="submitted && !cliente.cliTelefono1">se requiere teléfono </small>
                        </span>
                    </div>
                   <div class="field">
                            <label for="name">Correo Electrónico</label>
                            <span class="p-input-icon-left">
                                <i class="pi pi-envelope" />
                                <InputText v-model.trim="cliente.cliCorreo" required="true" autofocus :class="{ 'p-invalid': submitted && !cliente.cliCorreo }" />
                                <small class="p-invalid" v-if="submitted && !cliente.cliCorreo">se requiere correo </small>
                            </span>
                        </div>
                    <div class="field">
                        <label for="name">Dirección</label>
                        <span class="p-input-icon-left">
                            <i class="pi pi-map-marker" />
                            <InputText v-model.trim="cliente.cliDireccion1" required="true" autofocus :class="{ 'p-invalid': submitted && !cliente.cliDireccion1 }" />
                            <small class="p-invalid" v-if="submitted && !cliente.cliDireccion1">se requiere dirección </small>
                        </span>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" class="p-button-text" @click="saveCliente" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
