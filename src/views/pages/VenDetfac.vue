<script setup>
import { ref, onMounted } from 'vue';
import VehiculoService from '@/service/VehiculoService';
import VenEncfacService from '@/service/VenEncfacService';
import VenDetfacService from '@/service/VenDetfacService';
const { anio, encfacNumero, vhcspcfPlaca } = defineProps(['anio', 'encfacNumero', 'vhcspcfPlaca']);

console.log("Año:", anio);
console.log("Número de factura:", encfacNumero);
console.log("Placa:", vhcspcfPlaca);

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

</script>


<template>
  <div id="invoice" >
    <div id="invoice-top">
      <div class="info">
        <Button icon="pi pi-arrow-left" @click="regresar" class="p-button-rounded p-button bg-blue-900 text-white mr-2"></Button>
      </div>
      <div class="title">
        <div class="flex items-center mb-3">
          <label class="text-gray-900 text-2xl font-medium mb-0 mr-4">Factura</label>
          <div class="text-gray-900 text-2xl font-medium mb-0">{{ encfacNumero }}</div>
        </div>
        <div class="label mb-2">
            <span style="font-weight: bold;">Fecha:</span> {{ encfac.encfacFechaemision }}
        </div>
        <div class="label mb-2">
            <span style="font-weight: bold;">Usuario:</span> {{ encfac.usuIdentificacion }}
        </div>
      </div>
    </div>
    <div id="invoice-mid">
      <div class="info">
        <div class="flex items-center mb-3">
          <div class="bg-cyan-100 rounded-full p-2 mr-2">
            <i class="pi pi-user text-cyan-400 text-2xl"></i>
          </div>
          <label class="text-black-900 text-2xl font-medium mb-0">Propietario del Vehículo</label>
        </div>
        <div class="label mb-2">
            <span style="font-weight: bold;">Nombre:</span> {{ encfac.cliNombre }}
        </div>
        <div class="label mb-2">
            <span style="font-weight: bold;">Código:</span> {{ encfac.cliCodigo }}
        </div>
      </div>

      <div id="project" class="mb-6">
        <div class="flex items-center mb-3">
          <div class="bg-cyan-100 rounded-full p-2 mr-2">
            <i class="pi pi-car text-cyan-500 text-2xl"></i>
          </div>
          <label class="text-black text-2xl font-medium mb-0">Información del Vehículo</label>
        </div>
        <div class="flex justify-between mb-2">
          <div class="label mr-4">
              <span style="font-weight: bold;">Placa:</span> {{ vhcspcfPlaca }}
          </div>
          <div class="label">
              <span style="font-weight: bold;">Marca:</span> {{ vehiculo.vhcspcfMarcaDescrip }}
          </div>
        </div>
        <div class="flex justify-between">
          <div class="label mr-4">
              <span style="font-weight: bold;">Color:</span> {{ vehiculo.vhcspcfColor  }}
          </div>
          <div class="label">
              <span style="font-weight: bold;">Kilometraje:</span> {{ vehiculo.vhcspcfChequeo }}
          </div>
        </div>
      </div>
    </div>
    <div id="table" style="border-radius: 10px; overflow: hidden; width: 90%; margin: 0 auto;">
      <DataTable
            :value="detalles"
            :paginator="false"
            responsiveLayout="scroll"
          >
            <!-- Definición de las columnas del DataTable -->
            <Column field="detfacTipodet" header="Tipo" :sortable="false"  />
            <Column field="detfacCodigo" header="Código" :sortable="false" />
            <Column field="detfacDescripcion" header="Descripción" :sortable="false" />
            <Column field="detfacCantidad" header="Cantidad" :sortable="false"  />
            <Column field="detfacPrecio" header="Precio" :sortable="false" />
            <Column field="detfacDescuento" header="%Descuento" :sortable="false" />
            <Column field="detfacTotal" header="Total" :sortable="false" />
            <Column field="detfacEmpleado" header="Tec" :sortable="false"  />
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
</template>

<script>
export default {
  name: 'InvoiceComponent',
  // Puedes agregar aquí las propiedades, métodos y demás que necesites para tu componente Vue
}
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Roboto:100,300,400,900,700,500,300,100);
*{
  margin: 0;
  box-sizing: border-box;

}
h1{
  font-size: 1.5em;
  color: #222;
}
h2{font-size: .9em;}
h3{
  font-size: 1.2em;
  font-weight: 300;
  line-height: 2em;
}
p{
  font-size: .7em;
  color: #666;
  line-height: 1.2em;
}

#invoiceholder{
  width:100%;
  height: 100%;
  padding-top: 50px;
}
#headerimage{
  z-index: -1;
  position: relative;
  height: 100vh;
  -webkit-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,.15);
  -moz-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,.15);
  box-shadow: inset 0 2px 4px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,.15);
  overflow:hidden;
}

#invoice{
  position: relative;
  margin: 0 auto;
  width: 90%;
  background: #FFF;
}

[id*='invoice-']{ /* Targets all id with 'col-' */
  border-bottom: 1px solid #EEE;
  padding: 30px;
}

#invoice-top{min-height: 120px;}
#invoice-mid{min-height: 120px;}
#invoice-bot{ min-height: 250px;}

.logo{
  float: left;
  height: 60px;
  width: 60px;
  background: url(http://michaeltruong.ca/images/logo1.png) no-repeat;
  background-size: 60px 60px;
}
.clientlogo{
  float: left;
  height: 60px;
  width: 60px;
  background: url(http://michaeltruong.ca/images/client.jpg) no-repeat;
  background-size: 60px 60px;
  border-radius: 50px;
}
.info{
  display: block;
  float:left;
  margin-left: 40px;
}
.title{
  float: right;
}
.title p{text-align: right;}
#project{margin-left: 57%;}
table{
  width: 100%;
  border-collapse: collapse;
}
td{
  padding: 5px 0 5px 15px;
  border: 1px solid #EEE
}
.tabletitle{
  padding: 5px;
  background: #EEE;
}
.service{border: 1px solid #EEE;}
.item{width: 50%;}
.itemtext{font-size: .9em;}
</style>
