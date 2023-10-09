<script setup>
import { ref, onMounted, onBeforeMount  } from 'vue';
import KardexService from '@/service/KardexService';
import { FilterMatchMode } from 'primevue/api';
const { anio, artCodigo, artNombre, stock } = defineProps(['anio', 'artCodigo', 'artNombre', 'stock']);

console.log("Año:", anio);
console.log("Número de factura:", artCodigo);
console.log("Placa:", artNombre);
console.log("Placa:", stock);

const entradas = ref(null);
const salidas = ref(null);
const filters = ref({});
const layout = ref('grid');
const selectButtonValue1 = ref(null);
const selectButtonValues1 = ref([{ name: 'Entradas' }, { name: 'Salidas' }]);
const kardexService = new KardexService();

onMounted(async () => {
  try {
    // Realiza las llamadas a la API simultáneamente usando Promise.all
    await Promise.all([
        GetEntradas(),
        GetSalidas()
    ]);
    // Las llamadas a la API se han completado
    console.log('Llamadas a la API completadas');
  } catch (error) {
    console.error('Error al obtener datos de la API:', error);
  }
});

onBeforeMount(() => {
    initFilters();
});

const GetEntradas = async () => {
    entradas.value = await kardexService.getEntradas(anio, artCodigo);
    // Formatear las fechas en cada objeto dentro de clientes.value utilizando map
    entradas.value = entradas.value.map(linea => {
        if (linea.trnartFechaes) {
            const fecha = new Date(linea.trnartFechaes);
            linea.trnartFechaes = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
        }
        return linea;
    });
};

const GetSalidas = async () => {
    salidas.value = await kardexService.getSalidas(anio, artCodigo);
    // Formatear las fechas en cada objeto dentro de clientes.value utilizando map
    salidas.value = salidas.value.map(linea => {
        if (linea.trnartFechaes) {
            const fecha = new Date(linea.trnartFechaes);
            linea.trnartFechaes = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
        }
        return linea;
    });
};

const onOptionChange = (event) => {
  if (event.value.name === 'Entradas') {
    layout.value = 'grid';
  } else if (event.value.name === 'Salidas') {
    layout.value = 'list';
  }
};
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
          <div >
            <div class="mb-4"> 
                <Toolbar>
                    <template v-slot:start>
                        <h4>
                            <span style="font-weight: bold;">Producto:</span> {{  }}
                        </h4>
                    </template>
                    <template v-slot:end>
                        <SelectButton v-model="selectButtonValue1" :options="selectButtonValues1" optionLabel="name" dataKey="name" @change="onOptionChange" />
                    </template>
                </Toolbar>
            </div> 
            <div v-if="layout === 'list'">
                <DataTable
                    ref="dt"
                    :value="salidas"
                    :paginator="true"
                    :rows="5"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header >
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">KARDEX Cantidades</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column   field="trnartFechaes" 
                        header="Fecha" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartFechaes }}
                        </template>
                    </Column>
                    <Column field="trnartTipo"  
                        header="Concepto" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartTipo }}
                        </template>
                    </Column>
                    <Column field="bodCodigo"  
                        header="Bodega" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.bodCodigo }}
                        </template>
                    </Column>
                    <Column field="trnartOrigen"  
                        header="Tipo Doc" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartOrigen }}
                        </template>
                    </Column>
                    <Column field="trnartReferencia"  
                        header="# DOC" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.trnartReferencia }}
                        </template>
                    </Column>
                    <Column field="trnartCantidad"  
                        header="Egresos" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.trnartCantidad }}
                        </template>
                    </Column>
                    <Column field="trnartCostot" 
                        header="Cost" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatCurrency(slotProps.data.trnartCostot) }}
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div v-else-if="layout === 'grid'" >
                <DataTable
                    ref="dt"
                    :value="entradas"
                    :paginator="true"
                    :rows="5"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header >
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">KARDEX Cantidades</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column   field="trnartFechaes" 
                        header="Fecha" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartFechaes }}
                        </template>
                    </Column>
                    <Column field="trnartTipo"  
                        header="Concepto" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartTipo }}
                        </template>
                    </Column>
                    <Column field="bodCodigo"  
                        header="Bodega" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.bodCodigo }}
                        </template>
                    </Column>
                    <Column field="trnartOrigen"  
                        header="Tipo Doc" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartOrigen }}
                        </template>
                    </Column>
                    <Column field="trnartReferencia"  
                        header="# DOC" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.trnartReferencia }}
                        </template>
                    </Column>
                    <Column field="trnartCantidad"  
                        header="Ingresos" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.trnartCantidad }}
                        </template>
                    </Column>
                    <Column field="trnartCostot" 
                        header="Cost" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatCurrency(slotProps.data.trnartCostot) }}
                        </template>
                    </Column>
                </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
