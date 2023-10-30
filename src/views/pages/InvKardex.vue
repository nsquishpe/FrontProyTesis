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
const compra = ref(null);
const venta = ref(null);
const filters = ref({});
const layout = ref('grid');
const selectButtonValue1 = ref(null);
const selectButtonValues1 = ref([{ name: 'ENTRADAS' }, { name: 'SALIDAS' }]);
const kardexService = new KardexService();

onMounted(async () => {
  try {
    // Realiza las llamadas a la API simultáneamente usando Promise.all
    await Promise.all([
        GetEntradas(),
        GetSalidas(),
        GetCompra(),
        GetVenta()
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

const GetCompra = async () => {
    compra.value = await kardexService.getCom(anio, artCodigo);
};

const GetVenta = async () => {
    venta.value = await kardexService.getVen(anio, artCodigo);
};

const onOptionChange = (event) => {
  if (event.value.name === 'ENTRADAS') {
    layout.value = 'grid';
  } else if (event.value.name === 'SALIDAS') {
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
function convertirYFormatear(inputString) {
  const numero = parseFloat(inputString);
  if (!isNaN(numero)) {
    return numero.toFixed(3);
  } else {
    return 'Entrada inválida';
  }
}
</script>

<template>
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <div >
            <div class="mb-5"> 
                <Toolbar>
                    <template v-slot:start>
                        <Button icon="pi pi-arrow-left" class="p-button-secondary mr-4" />
                        <SelectButton v-model="selectButtonValue1" :options="selectButtonValues1" optionLabel="name" dataKey="name" @change="onOptionChange" class="custom-select-button"/>
                    </template>
                    <template v-slot:end>
                        <div>
                            <h3 class="noto-sans-font">
                           <label></label>{{ artNombre }} - <strong>{{ artCodigo }}</strong> 
                            </h3>
                        </div>
                    </template>
                </Toolbar>
            </div> 
            <div class="contenedor mb-2">
                <div class="seccion seccion-1">
                    <h4 class="noto-sans-font mb-2">
                        <i class="custom-icon mr-1"></i>
                        <label style="font-weight: bold;">
                        Stock:  
                        </label> 
                        {{ stock}} unidades
                    </h4>
                </div>
            </div>
            <div class="contenedor mb-2">
                <div class="seccion seccion-1">
                    <h4 class="noto-sans-font mb-2">
                        <label style="font-weight: bold;">
                         P. Compra:
                        </label> 
                        <i class="pi pi-dollar text-2xl text-blue-500"></i> {{ convertirYFormatear(compra) }}
                    </h4>
                </div>
                <div class="seccion seccion-2">
                    <h4 class="noto-sans-font mb-2">
                        <label style="font-weight: bold;">
                        P.V.P: 
                        </label> 
                        <i class="pi pi-dollar text-2xl text-blue-500"></i> {{ convertirYFormatear(venta) }}
                    </h4>
                </div>
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
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} líneas Kardex"
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
                        header="FECHA" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartFechaes }}
                        </template>
                    </Column>
                    <Column field="trnartTipo"  
                        header="CONCEPTO" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartTipo }}
                        </template>
                    </Column>
                    <Column field="bodCodigo"  
                        header="BODEGA" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.bodCodigo }}
                        </template>
                    </Column>
                    <Column field="trnartOrigen"  
                        header="TIPO DOC" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartOrigen }}
                        </template>
                    </Column>
                    <Column field="trnartReferencia"  
                        header="# DOC" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.trnartReferencia }}
                        </template>
                    </Column>
                    <Column field="trnartCantidad"  
                        header="EGRESOS" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.trnartCantidad }}
                        </template>
                    </Column>
                    <Column field="trnartCostot" 
                        header="COSTO" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
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
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} líneas Kardex"
                    responsiveLayout="scroll"
                >
                    <template #header >
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">KARDEX</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column   field="trnartFechaes" 
                        header="FECHA" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartFechaes }}
                        </template>
                    </Column>
                    <Column field="trnartTipo"  
                        header="CONCEPTO" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartTipo }}
                        </template>
                    </Column>
                    <Column field="bodCodigo"  
                        header="BODEGA" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.bodCodigo }}
                        </template>
                    </Column>
                    <Column field="trnartOrigen"  
                        header="TIPO DOC" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.trnartOrigen }}
                        </template>
                    </Column>
                    <Column field="trnartReferencia"  
                        header="# DOC" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.trnartReferencia }}
                        </template>
                    </Column>
                    <Column field="trnartCantidad"  
                        header="INGRESOS" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.trnartCantidad }}
                        </template>
                    </Column>
                    <Column field="trnartCostot" 
                        header="COSTO" 
                        :sortable="true" 
                        :headerStyle="{ width: '14%', minWidth: '10rem', backgroundColor: '#DAFFBB' }">
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
@import url(https://fonts.googleapis.com/css?family=Roboto:100,300,400,900,700,500,300,100);
.contenedor {
  display: flex;
  flex-direction: row;
}

.seccion {
  flex: 1; /* El contenido de ambas secciones tomará el mismo espacio */
  text-align: center; /* Alineación del texto al centro */
}
.custom-icon {
    display: inline-block;
    width: 3rem; /* Establece el ancho del icono */
    height: 3rem; /* Establece la altura del icono */
    background-image: url('/demo/images/login/kardex.png'); /* Ruta de la imagen de la foto del propietario */
    background-size: cover; /* Ajusta la imagen para cubrir completamente el contenedor */
    background-repeat: no-repeat; /* Evita la repetición de la imagen */
    background-position: center center; /* Centra la imagen en el contenedor */
    border-radius: 50%; /* Redondea las esquinas para que la imagen tenga forma circular */
    margin-right: 0.75rem; /* Margen a la derecha del icono */
    vertical-align: middle; /* Alinea verticalmente el icono en línea con el texto */
}
:deep(.custom-select-button .p-button.p-highlight) {
  /* Cambia el color de fondo del botón */
  background-color: #03BB85;
}
</style>
