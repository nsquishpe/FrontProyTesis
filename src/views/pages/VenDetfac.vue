<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import VehiculoService from '@/service/VehiculoService';
import VenEncfacService from '@/service/VenEncfacService';
import VenDetfacService from '@/service/VenDetfacService';
import { FilterMatchMode } from 'primevue/api';
const { anio, encfacNumero, vhcspcfPlaca } = defineProps(['anio', 'encfacNumero', 'vhcspcfPlaca']);

console.log("Año:", anio);
console.log("Número de factura:", encfacNumero);
console.log("Placa:", vhcspcfPlaca);
const filters = ref({});
const detalles = ref([]);

const venDetfacService = new VenDetfacService();
const vehiculoService = new VehiculoService();
const venEncfacService = new VenEncfacService();

const vehiculo = ref({
  vhcspcfPlaca: '',
  vhcspcfMarcaDescrip: '',
  vhcspcfColor: '',
  vhcspcfChequeo: 0
});

const encfac = ref({
    encfacNumero: '',
    cliNombre: '',
    cliCodigo: '',
    usuIdentificacion : '',
    encfacFechaemision: '',
    encfacTotal: 0,
    encfacTotalneto: 0,
    encfacValoriva: 0
});

onMounted(async () => {
  try {
    // Realiza las llamadas a la API simultáneamente usando Promise.all
    await Promise.all([
      GetAuto(),
      GetEncFac(),
      GetDetalles()
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

const GetAuto = async () => {
    vehiculo.value = await vehiculoService.getVehiculo(anio, vhcspcfPlaca, encfacNumero);
    console.log(vehiculo.value.vhcspcfChequeo);
};
const GetEncFac = async () => {
    encfac.value = await venEncfacService.getVenEncfacById(anio, encfacNumero);
    // Formatear la fecha
    if (encfac.value.encfacFechaemision) {
        const fecha = new Date(encfac.value.encfacFechaemision);
        encfac.value.encfacFechaemision = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
    }
};
const GetDetalles = async () => {
    const response = await venDetfacService.getDetalles(anio, encfacNumero);
    detalles.value = response.filter(item => item.detfacDescripcion !== null && item.descripcion !== '');
    console.log(detalles.value);
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

<div class="grid" >
  <div class="col-12">
    <div class="card">
      <Toolbar class="mb-2" style="width: 95%; margin: 0 auto;">
                    <template v-slot:start>
                      <Button icon="pi pi-arrow-left" @click="regresar" class="p-button-rounded p-button bg-blue-900 text-white mr-2"></Button>
                    </template>
                    <template v-slot:end>
                      <div>
                        <h4>
                              <span style="font-weight: bold;">Factura:</span> {{ encfacNumero }}
                        </h4>
                        <div class="info-item" style="color: black;" >
                            <span style="font-weight: bold;">Fecha:</span> {{ encfac.encfacFechaemision }}
                        </div>
                        <div class="info-item" style="color: black;">
                            <span style="font-weight: bold;">Usuario:</span> {{ encfac.usuIdentificacion }}
                        </div>
                    </div>
                    </template>
      </Toolbar>

      <div class="grid" style="width: 95%; margin: 0 auto;">
            <div class="card mb-2 mr-5"  style="width: 40%;">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-700 font-medium mb-3" style="font-size: 1.5rem;">Propietario</span>
                        <div class="text-900 font-medium text-xl">
                          {{ encfac.cliNombre }}
                        </div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.9rem; height: 2.9rem">
                        <i class="pi pi-user text-cyan-400 text-3xl"></i>
                    </div>
                </div>
                <div class="label mb-2" style="color: black;">
                    <span style="font-weight: bold;">Código:</span> {{ encfac.cliCodigo }}
                </div>
            </div>
            <div class="card mb-2" style="width: 40%;">
                <div class="flex justify-content-between mb-3">
                    <div>
                      <span class="block text-700 font-medium mb-3" style="font-size: 1.5rem;">Vehículo</span>
                      <div class="text-900 font-medium text-xl">
                          <span class="mr-2">{{ vehiculo.vhcspcfMarcaDescrip }}</span>
                          <span class="text-blue-500">{{ vhcspcfPlaca }}</span>
                      </div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.9rem; height: 2.9rem">
                        <i class="pi pi-car text-cyan-400 text-3xl"></i>
                    </div>
                </div>
                <div class="flex justify-between">
                  <div class="label mr-4" style="color: black;">
                      <span style="font-weight: bold;">Color:</span> {{ vehiculo.vhcspcfColor  }}
                  </div>
                  <div class="label" style="color: black;">
                      <span style="font-weight: bold;">Kilometraje:</span> {{ vehiculo.vhcspcfChequeo }}
                  </div>
                </div>
            </div>
        </div>

        <div id="table" style="border-radius: 10px; overflow: hidden; width: 95%; margin: 0 auto;">
      <DataTable
                    ref="dt"
                    :value="detalles"
                    :paginator="true"
                    :rows="8"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[8, 13, 18]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header >
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Detalle</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>
                    <Column   field="detfacTipodet" 
                        header="Tipo" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacTipodet }}
                        </template>
                    </Column>
                    <Column   field="detfacCodigo" 
                        header="Código" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacCodigo }}
                        </template>
                    </Column>
                    <Column field="detfacDescripcion"  
                        header="Descripción" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacDescripcion }}
                        </template>
                    </Column>
                    <Column field="detfacCantidad"  
                        header="Cantidad" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacCantidad }}
                        </template>
                    </Column>
                    <Column field="detfacPrecio" 
                        header="Precio" 
                        :sortable="true" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatCurrency(slotProps.data.detfacPrecio) }}
                        </template>
                    </Column>
                    <Column field="detfacDescuento"  
                        header="% Descuento" 
                        :sortable="true" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacDescuento }}
                        </template>
                    </Column>
                    <Column field="detfacTotal"  
                        header="Total" 
                        :sortable="true" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacTotal }}
                        </template>
                    </Column>
                    <Column field="detfacEmpleado"  
                        header="Tec" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacEmpleado }}
                        </template>
                    </Column>
      </DataTable>
    </div>

    <!-- Fila adicional después del DataTable -->
    <div id="invoice-top" style="text-align: right; max-width: 90%; margin: 0 auto;">
        <div class="label mb-2">
            <span style="font-weight: bold;">Total Neto: </span> {{encfac.encfacTotalneto}}
        </div>
        <div class="label mb-2">
            <span style="font-weight: bold;">Valor IVA: </span> {{encfac.encfacValoriva }}
        </div>
        <div class="label mb-2">
            <span style="font-weight: bold;">TOTAL: </span> {{encfac.encfacTotal}}
        </div>
    </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'InvoiceComponent',
  // Puedes agregar aquí las propiedades, métodos y demás que necesites para tu componente Vue
}
</script>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
@import url(https://fonts.googleapis.com/css?family=Roboto:100,300,400,900,700,500,300,100);
*{
  margin: 0;
  box-sizing: border-box;

}
</style>