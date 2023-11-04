<script setup>
import {ref, onMounted, onBeforeMount } from 'vue';
import VehiculoService from '@/service/VehiculoService';
import VenEncfacService from '@/service/VenEncfacService';
import VenDetfacService from '@/service/VenDetfacService';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const { anio, encfacNumero, vhcspcfPlaca } = defineProps(['anio', 'encfacNumero', 'vhcspcfPlaca']);

const garantia = ref(null);
const fecha = ref(null);

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
    encfacValoriva: 0,
    encfacObsgarantia: ''
});

const observaciones = ref(encfac.value.encfacObsgarantia || '');

onMounted(async () => {
  try {
    // Realiza las llamadas a la API simultáneamente usando Promise.all
    await Promise.all([
      GetAuto(),
      GetEncFac(),
      GetDetalles()
    ]);
    observaciones.value = encfac.value.encfacObsgarantia;
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
    fecha.value = encfac.value.encfacFechaemision;
    // Formatear la fecha
    if (encfac.value.encfacFechaemision) {
        const fecha = new Date(encfac.value.encfacFechaemision);
        encfac.value.encfacFechaemision = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
    }
    console.log(encfac.value);
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

const displayConfirmation = ref(false);

const openConfirmation = () => {
    displayConfirmation.value = true;
};

const closeConfirmation = async (saved) => {
  displayConfirmation.value = false;
  try {
    if (saved && observaciones.value !== "") {
      garantia.value = '1';
      guardarValorDelTextarea(observaciones.value);
    } else {
      garantia.value = '0';
      observaciones.value = '';
    }
    encfac.value.encfacFechaemision =fecha;
    encfac.value.encfacGarantia = garantia.value;
    encfac.value.encfacObsgarantia = observaciones.value;
    const response = await venEncfacService.updateVenEncfac(encfac.value);
    console.log(encfac.value);
    mostrarToast();
  } catch (error) {
    // Manejar errores 
    console.error("Error al actualizar la orden:", error);
  }
};

const guardarValorDelTextarea = (valor) => {
    // Lógica para guardar el valor del textarea (por ejemplo, enviar a la API)
    console.log("Valor del textarea guardado:", valor);
};

const mostrarToast = () => {
    // Lógica para mostrar un toast con el mensaje proporcionado
    toast.add({ severity: 'success', summary: 'Exitoso', detail: 'Garantía Actualizada', life: 3000 });
};
</script>


<template>

<div class="grid" >
  <div class="col-12">
    <div class="card">
      <Toolbar class="mb-0.5">
                    <template v-slot:start>
                        <Button icon="pi pi-arrow-left" class="p-button-secondary mr-2" />
                        <Button label="Garantía"  icon="pi pi pi-verified" class="p-button-success" @click="openConfirmation" />
                        <Toast />
                        <Dialog header="Retorno Garantía" v-model:visible="displayConfirmation" :style="{ width: '350px' }" :modal="true">
                            <div class="flex align-items-center justify-content-center" style="width: 100%;">
                                <Textarea rows="5" v-model="observaciones"></Textarea>
                            </div>
                            <template #footer>
                                <Button  label="No" icon="pi pi-times" @click="closeConfirmation(false)" class="p-button-text p-button-danger" :autofocus="encfac.encfacGarantia === '0'" />
                                <Button  label="Sí" icon="pi pi-check" @click="closeConfirmation(true)" class="p-button-text p-button-success" :autofocus="encfac.encfacGarantia === '1'" />
                            </template>
                        </Dialog>
                    </template>
                    <template v-slot:end>
                      <div >
                        <h2 class="noto-sans-font mb-2">
                            <i class="pi pi-calculator" style="font-size: 1.8rem; color: #779ecb;"></i>
                           <label> Factura: </label>{{ encfacNumero }}
                        </h2>
                        <h6 class="noto-sans-font" style="text-align: right;">
                            <label style="font-weight: bold;">Fecha:</label> {{ encfac.encfacFechaemision }}
                        </h6>
                        <h6 class="noto-sans-font" style="text-align: right;">
                            <label style="font-weight: bold;">Usuario:</label> {{ encfac.usuIdentificacion }}
                        </h6>
                    </div>
                    </template>
      </Toolbar>

      <div class="grid">
            <div class="field col-12 md:col-6">
                <Panel header="PROPIETARIO" :toggleable="true">
                    <div class="text-900 font-medium text-xl">
                        <i class="custom-icon2 mr-2"></i>
                        <label class="mr-2" > {{ encfac.cliNombre }} - </label>
                        <Label>{{ encfac.cliCodigo }}</Label>
                    </div>
                </Panel>
            </div>
            <div class="field col-12 md:col-6">
                <Panel header="VEHÍCULO" :toggleable="true">
                    <div class="text-900 font-medium text-xl">
                        <i class="custom-icon mr-3"></i>
                        <label class="mr-3" >{{ vehiculo.vhcspcfMarcaDescrip }}</label>
                        <Tag class="placa mr-7"  style="font-size: 16px;">{{ vhcspcfPlaca }}</Tag>
                        <label class="mr-2"> {{ vehiculo.vhcspcfColor}} -</label>
                        <label> {{vehiculo.vhcspcfChequeo }} km</label>
                    </div>
                </Panel>
            </div>
        </div>

        <DataTable
                    ref="dt"
                    :value="detalles"
                    :paginator="true"
                    :rows="8"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[8, 13, 18]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} líneas"
                    responsiveLayout="scroll"
                >
                    <template #header >
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Detalle</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar detalle" />
                            </span>
                        </div>
                    </template>
                    <Column   field="detfacTipodet" 
                        header="TIPO" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <Tag :class="'serv-badge tipo-' + (slotProps.data.detfacTipodet ? slotProps.data.detfacTipodet.toLowerCase() : '')" style="font-size: 16px;">{{ slotProps.data.detfacTipodet }}</Tag>
                        </template>
                    </Column>
                    <Column   field="detfacCodigo" 
                        header="CÓDIGO" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }" >
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacCodigo }}
                        </template>
                    </Column>
                    <Column field="detfacDescripcion"  
                        header="DESCRIPCIÓN" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span><strong>{{ slotProps.data.detfacDescripcion }}</strong></span>
                        </template>
                    </Column>
                    <Column field="detfacCantidad"  
                        header="CANTIDAD" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacCantidad }}
                        </template>
                    </Column>
                    <Column field="detfacPrecio" 
                        header="PRECIO" 
                        :sortable="true" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatCurrency(slotProps.data.detfacPrecio) }}
                        </template>
                    </Column>
                    <Column field="detfacDescuento"  
                        header="%DESCUENTO" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacDescuento }}
                        </template>
                    </Column>
                    <Column field="detfacTotal"  
                        header="TOTAL" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ formatCurrency(slotProps.data.detfacTotal) }}
                        </template>
                    </Column>
                    <Column field="detfacEmpleado"  
                        header="TEC" 
                        :sortable="false" 
                        :headerStyle="{ backgroundColor: '#E1F5FE' }">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.detfacEmpleado }}
                        </template>
                    </Column>
      </DataTable>

    <!-- Fila adicional después del DataTable -->
    <div id="invoice-top" style="text-align: right; max-width: 90%; margin: 0 auto;">
        <h5 class="noto-sans-font mb-2" style="text-align: right;">
            <label style="font-weight: bold;">Total Neto:</label> {{ encfac.encfacTotalneto}}
        </h5>
        <h5 class="noto-sans-font mb-2" style="text-align: right;">
            <label style="font-weight: bold;">Valor IVA:</label> {{ encfac.encfacValoriva}}
        </h5>
        <h5 class="noto-sans-font mb-2" style="text-align: right;">
            <label style="font-weight: bold;">TOTAL:</label> {{ encfac.encfacTotal}}
        </h5>
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
.text-900 {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center; /* Asegura que el texto dentro del div esté centrado */
    height: 100%; /* Ajusta la altura según sea necesario */
}
:deep(.p-panel .p-panel-header) {
    background-color: var(--teal-500);
    border-color: var(--teal-500);
    color: #ffffff;
    font-size: 1.1em; 
    text-align: center; 
}

:deep(.p-panel .p-panel-content) {
    border-color: var(--teal-500);
}
.custom-icon {
    display: inline-block;
    width: 3rem; /* Establece el ancho del icono */
    height: 3rem; /* Establece la altura del icono */
    background-image: url('/demo/images/login/auto.png'); /* Ruta de la imagen de la foto del propietario */
    background-size: cover; /* Ajusta la imagen para cubrir completamente el contenedor */
    background-repeat: no-repeat; /* Evita la repetición de la imagen */
    background-position: center center; /* Centra la imagen en el contenedor */
    border-radius: 50%; /* Redondea las esquinas para que la imagen tenga forma circular */
    margin-right: 0.75rem; /* Margen a la derecha del icono */
    vertical-align: middle; /* Alinea verticalmente el icono en línea con el texto */
}
.custom-icon2 {
    display: inline-block;
    width: 3rem; /* Establece el ancho del icono */
    height: 3rem; /* Establece la altura del icono */
    background-image: url('/demo/images/login/usuario.png'); /* Ruta de la imagen de la foto del propietario */
    background-size: cover; /* Ajusta la imagen para cubrir completamente el contenedor */
    background-repeat: no-repeat; /* Evita la repetición de la imagen */
    background-position: center center; /* Centra la imagen en el contenedor */
    border-radius: 50%; /* Redondea las esquinas para que la imagen tenga forma circular */
    margin-right: 0.75rem; /* Margen a la derecha del icono */
    vertical-align: middle; /* Alinea verticalmente el icono en línea con el texto */
}

</style>