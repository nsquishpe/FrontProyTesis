<script setup>
import { ref, onMounted, watch , computed } from 'vue';
import OrdTrabCabService from '@/service/OrdTrabCabService';
import MarcaService from '@/service/MarcaService';
import ClienteService from '@/service/ClienteService';
import ColorService from '@/service/ColorService';
import ServicioService from '@/service/ServicioService';
const year = '2023'; 
const canvas = ref(null);

//Servicios
const marcaService = new MarcaService();
const clienteService = new ClienteService();
const colorService = new ColorService();
const servicioService = new ServicioService();

//Manejo Clientes
const selectedCliente = ref(null);
const autoValueCliente = ref(null);
const autoFilteredValueCliente = ref([]);
//Manejo Colores
const selectedColor = ref(null);
const autoValueColor = ref(null);
const autoFilteredValueColor = ref([]);
//Manejo Marcas
const selectedMarca = ref(null);
const autoValueMarca  = ref(null);
const autoFilteredValueMarca = ref([]);
//Manejo Servicios
const multiselectServicios = ref([]);
const multiselectServicio = ref(null);

const calendarValue = ref(null);
const knobValue = ref(50);


const multiselectValues = ref([
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil', code: 'BR' }
]);
const items = ref([
      { text: 'Frase 1', checked: false, comment: '' },
      { text: 'Frase 2', checked: false, comment: '' }
]);



onMounted(() => {
  clienteService.getClientes(year).then((data) => (autoValueCliente.value = data));
  colorService.getColores().then((data) => (autoValueColor.value = data));
  marcaService.getMarcas().then((data) => (autoValueMarca.value = data));
  servicioService.getServicios().then((data) => {
    // Mapea los datos para tener un array con las propiedades necesarias
    multiselectServicios.value = data.map((servicio) => ({
      name: servicio.serDescrip,
      code: servicio.serCodigo
    }));
  });
  setCanvas();
});


const BuscarCLiente = (event) => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      autoFilteredValueCliente.value = formatearClientes(autoValueCliente.value);
    } else {
      autoFilteredValueCliente.value = formatearClientes(
        autoValueCliente.value.filter((cliente) => {
          return cliente.cliNombre.toLowerCase().includes(event.query.toLowerCase()) || cliente.cliCodigo.includes(event.query);;
        })
      );
    }
  }, 250);
};

const formatearClientes = (clientes) => {
  return clientes.map((cliente) => {
    return {
      label: `${cliente.cliNombre} - ${cliente.cliCodigo}`,
      value: cliente, // Mantén el objeto de cliente completo como valor
    };
  });
};
const BuscarColores = (event) => {
    setTimeout(() => {
        if (!event.query.trim().length) {
            autoFilteredValueColor.value = [...autoValueColor.value];
        } else {
            autoFilteredValueColor.value = autoValueColor.value.filter((color) => {
                return color.maecolorDescripcion.toLowerCase().includes(event.query.toLowerCase());
            });
        }
    }, 250);
};
const BuscarMarcas = (event) => {
    setTimeout(() => {
        if (!event.query.trim().length) {
            autoFilteredValueMarca.value = [...autoValueMarca.value];
        } else {
            autoFilteredValueMarca.value = autoValueMarca.value.filter((marca) => {
                return marca.vehmarmodNombre.toLowerCase().includes(event.query.toLowerCase());
            });
        }
    }, 250);
};

 // Observa cambios en selectedAutoValue
 watch(multiselectServicio, (newValue) => {
      console.log('selectedCliente se ha actualizado:', newValue);
});


/*CANVAS*/
function drawImageOnCanvas(ctx, imageUrl, width, height) {
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
  };
  img.src = imageUrl;
}
function setCanvas() {
  const ctx = canvas.value.getContext('2d');
  const screenWidth = window.innerWidth * 0.5; 
  const screenHeight = window.innerHeight * 0.5; 
  canvas.value.width = screenWidth;
  canvas.value.height = screenHeight;
  drawImageOnCanvas(ctx, 'demo/images/galleria/galleria11.png', screenWidth, screenHeight);
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="section mb-5">
                    <Toolbar>
                    <template v-slot:start>
                        <Button icon="pi pi-arrow-left" class="p-button-info" />
                    </template>
                    <template v-slot:end>
                        <label for="city">Orden Trabjo</label>
                    </template>
                </Toolbar>
                </div>
                <!-- Sección Cliente -->
                <div class="section">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-3 mr-5">
                            <label for="firstname2">Fecha</label>
                            <Calendar :showIcon="true" :showButtonBar="true" v-model="calendarValue"></Calendar>
                        </div>
                        <div class="field col-12 md:col-5 mr-8" >
                            <label for="lastname2">Cliente</label>
                            <AutoComplete placeholder="Buscar" id="dd" :dropdown="true" :multiple="false" v-model="selectedCliente" 
                            :suggestions="autoFilteredValueCliente" @complete="BuscarCLiente($event)" field="label" />
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="lastname2">Tanque de Gasolina</label>
                            <Knob v-model="knobValue" :step="10" :min="0" :max="100" valueTemplate="{value}%" />
                        </div>
                    </div>
                </div>
                <!-- Sección Datos del Vehículo -->
                <div class="section">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-3">
                            <label for="city">Placa</label>
                            <InputText id="city" type="text" />
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="state">Color</label>
                            <AutoComplete placeholder="Buscar" id="dd" :dropdown="true" :multiple="false" v-model="selectedColor" 
                            :suggestions="autoFilteredValueColor" @complete="BuscarColores($event)" field="maecolorDescripcion" />

                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="state">Marca</label>
                            <AutoComplete placeholder="Buscar" id="dd" :dropdown="true" :multiple="false" v-model="selectedMarca" 
                            :suggestions="autoFilteredValueMarca" @complete="BuscarMarcas($event)" field="vehmarmodNombre" />
                        </div>
                    </div>
                </div>
                <!-- Sección Observaciones -->
                <div class="section">
                    <h5>Inventario de Vehiculo</h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-4">
                            <Panel header="Interiores" :toggleable="true">
                                <div v-for="(item, index) in items" :key="index" class="item"  style="margin-bottom: 10px;">
                                    <Checkbox id="checkOption1" name="option" value="Chicago" v-model="item.checked" style="margin-right: 20px;" />
                                    <label style="margin-right: 20px;">{{ item.text }}</label>
                                    <input v-model="item.comment" style="padding: 4px; border: 1px solid #ccc; border-radius: 5px; width: 3.5em;">
                                </div>
                            </Panel>
                        </div>
                        <div class="field col-12 md:col-4">
                            <Panel header="Exteriores" :toggleable="true">
                                <div v-for="(item, index) in items" :key="index" class="item"  style="margin-bottom: 10px;">
                                    <Checkbox id="checkOption1" name="option" value="Chicago" v-model="item.checked" style="margin-right: 20px;" />
                                    <label style="margin-right: 20px;">{{ item.text }}</label>
                                    <input v-model="item.comment" style="padding: 4px; border: 1px solid #ccc; border-radius: 5px; width: 3.5em;">
                                </div>
                            </Panel>
                        </div>
                        <div class="field col-12 md:col-4">
                            <Panel header="Accesorios" :toggleable="true">
                                <div v-for="(item, index) in items" :key="index" class="item"  style="margin-bottom: 10px;">
                                    <Checkbox id="checkOption1" name="option" value="Chicago" v-model="item.checked" style="margin-right: 20px;" />
                                    <label style="margin-right: 20px;">{{ item.text }}</label>
                                    <input v-model="item.comment" style="padding: 4px; border: 1px solid #ccc; border-radius: 5px; width: 3.5em;">
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
                <!-- Sección Servicios -->
                <div class="section">
                    <h5>Servicios</h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-11 md:col-12">
                            <MultiSelect v-model="multiselectServicio" :options="multiselectServicios" optionLabel="name" placeholder="Select Countries" :filter="true">
                                <template #value="slotProps">
                                    <div class="inline-flex align-items-center py-1 px-2 bg-primary text-primary border-round mr-2" v-for="option of slotProps.value" :key="option.code">
                                        <div>{{ option.name }}</div>
                                    </div>
                                    <template v-if="!slotProps.value || slotProps.value.length === 0">
                                        <div class="p-1">Selecciona Servicios</div>
                                    </template>
                                </template>
                                <template #option="slotProps">
                                    <div class="flex align-items-center">
                                        <div>{{ slotProps.option.name }}</div>
                                    </div>
                                </template>
                            </MultiSelect>
                        </div>
                    </div>
                </div>                
                <!-- Sección Foto -->
                <div class="section">
                    <h5>Daños</h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6 ">
                            <canvas ref="canvas"></canvas>
                        </div>
                    </div>
                </div>
                <!-- Sección Observaciones -->
                <div class="section">
                    <h5>Observaciones</h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <Textarea id="address" rows="4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.field canvas {
  width: 100%; /* Asegura que el canvas ocupe el 100% del ancho del contenedor */
  height: 100%; /* Asegura que el canvas ocupe el 100% de la altura del contenedor */
}
</style>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
