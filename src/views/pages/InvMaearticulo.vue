<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch  } from 'vue';
import InvMaeGrupoService from '@/service/InvMaeGrupoService';
import ArticuloService from '@/service/ArticuloService';
import { useRouter } from 'vue-router'; // Importa useRouter de vue-router
const router = useRouter(); // Obtén el objeto router

const dt = ref(null);
const filters = ref({});

const invMaeGrupoService = new InvMaeGrupoService();
const articuloService = new ArticuloService();

const productos = ref(null);
const producto = ref({
    artCodigo : '',
    artNombre : '',
    grupNombre : '',
    precio : '',
    stock : '',
    inventoryStatus : ''
});

//Select Anios
const years = ref(['2018','2019','2020', '2021', '2022', '2023']); // Lista de años como cadenas
const selectedYear =  ref({ label: '2023', value: '2023' }); // Valor por defecto del select como cadena
const dropdownYears = years.value.map(year => ({ label: year, value: year }));
//Select categorias
const dropdownCategorias = ref([]);
const selectedCategoria = ref({ label: 'ACEITES', value: '01' }); // Valor por defecto del select como cadena

onBeforeMount(() => {
    initFilters();
    CargarCategorias();
});
onMounted(() => {
    RefreshProductos();
});
watch(selectedYear, (newValue, oldValue) => {
    CargarCategorias();
});

const CargarCategorias = async () => {
    try {
        const selectedYearValue = selectedYear.value.value;
        const categorias = await invMaeGrupoService.getGrupos(selectedYearValue);
        
        // Formatea los datos de las categorías para el Dropdown
        dropdownCategorias.value = categorias.map(categoria => ({
            label: categoria.grupNombre,
            value: categoria.grupCodigo
        }));
    } catch (error) {
        console.error('Error al cargar las categorías:', error);
    }
};
const RefreshProductos = async () => {
    const selectedYearValue = selectedYear.value.value; 
    const selectedGrupNombre = selectedCategoria.value.label; 
    const selectedGrupCod = selectedCategoria.value.value; 
    productos.value = await articuloService.modeloArticulo(selectedYearValue, selectedGrupCod, selectedGrupNombre );
};
const goDetalleKardex = (anio, artCodigo, artNombre, stock) => {
  anio = anio.value; 
  // Navegar a la página VenDetfac con parámetros
  router.push({ name: 'invKardex', params: { anio, artCodigo, artNombre, stock } });
};

//Aparte

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const exportCSV = () => {
    dt.value.exportCSV();
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
                            <label for="dropdownYears" style="font-weight: bold;color: black;font-size: 1.05em;" class="mr-1">PERIODO: </label>
                            <Dropdown v-model="selectedYear" :options="dropdownYears" optionLabel="label" placeholder="Año" class="mr-4" />
                            <label for="dropdownYears" style="font-weight: bold;color: black;font-size: 1.05em;" class="mr-1">CATEGORÍAS: </label>
                            <Dropdown v-model="selectedCategoria" :options="dropdownCategorias" optionLabel="label" placeholder="Año" @focus="RefreshProductos" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-secondary" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="productos"
                    :dataKey="producto.artCodigo"
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
                            <h5 class="m-0">Administrar Inventario</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column field="artCodigo" header="Código" :sortable="true" headerStyle="width:8%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.artCodigo }}
                        </template>
                    </Column>
                    <Column field="artNombre" header="Descripción" :sortable="true" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.artNombre }}
                        </template>
                    </Column>
                    <Column field="grupNombre" header="Categoría" :sortable="true" headerStyle="width:8%; min-width:8rem;">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.grupNombre) }}
                        </template>
                    </Column>
                    <Column field="precio" header="Precio" :sortable="true" headerStyle="width:8%; min-width:8rem;">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.precio) }}
                        </template>
                    </Column>
                    <Column field="stock" header="Stock" :sortable="true" headerStyle="width:8%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.stock }}
                        </template>
                    </Column>
                    <Column field="inventoryStatus" header="Status" :sortable="true" headerStyle="width:8%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <span :class="'product-badge status-' + (slotProps.data.inventoryStatus ? slotProps.data.inventoryStatus.toLowerCase() : '')">{{ slotProps.data.inventoryStatus }}</span>
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #header> Visualizar </template>
                        <template #body="slotProps">
                            <Button icon="pi pi-search" type="button" class="p-button-rounded p-button mr-2" style="background-color: #2e78ba;" @click="goDetalleKardex(selectedYear, slotProps.data.artCodigo, slotProps.data.artNombre, slotProps.data.stock)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>