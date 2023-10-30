<script setup>
import { ref, onMounted, watch , computed } from 'vue';
import OrdTrabCabService from '@/service/OrdTrabCabService';
import OrdTrabDetInvService from '@/service/OrdTrabDetInvService';
import OrdTrabDetSerService from '@/service/OrdTrabDetSerService';
import MarcaService from '@/service/MarcaService';
import ClienteService from '@/service/ClienteService';
import ColorService from '@/service/ColorService';
import ServicioService from '@/service/ServicioService';
import InvVehiculoService from '@/service/InvVehiculoService';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const router = useRouter();
const { num, selectedYearValue } = defineProps(['num', 'selectedYearValue']);
const toast = useToast();
const year = '2023'; 
const submitted = ref(false);
const marcaService = new MarcaService();
const clienteService = new ClienteService();
const colorService = new ColorService();
const servicioService = new ServicioService();
const invVehiculoService = new InvVehiculoService();
const ordTrabCabService = new OrdTrabCabService();
const ordTrabDetInvService = new OrdTrabDetInvService();
const ordTrabDetSerService = new OrdTrabDetSerService();
const calendarValue = ref(null);
const observaciones = ref(null);
const placa = ref(null);
const km = ref(null);
const knobValue = ref(50);

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
//Inventario
const interior = ref([]);
const exterior = ref([]);
const accesorios = ref([]);
const elementosSeleccionados = ref([]);
//Canvas
const canvas = ref(null);
const drawing = ref(false);
let ctx = null;
let lastX = 0;
let lastY = 0;
const strokeColor = ref('#0000FF'); 
const strokeWidth = ref(4); 

/*****************************    FUNCIONES APOYO    ********************************/

function actualizarElementos(array, apiArray, codigosPermitidos) {
    array.forEach(item => {
        const apiData = apiArray.find(apiItem => apiItem.invCodigo === item.invCodigo);
        if (apiData) {
            item.selected = true; 
            if (codigosPermitidos.includes(item.invCodigo)) {
                item.texto = apiData.invDescrip;
            }
        }
    });
}
const convertirYFormatearFecha = (fechaVue) => {
  const fechaObj = new Date(fechaVue);
  const año = fechaObj.getFullYear();
  const mes = ('0' + (fechaObj.getMonth() + 1)).slice(-2);
  const día = ('0' + fechaObj.getDate()).slice(-2);
  const horas = ('0' + fechaObj.getHours()).slice(-2);
  const minutos = ('0' + fechaObj.getMinutes()).slice(-2);
  const segundos = ('0' + fechaObj.getSeconds()).slice(-2);
  const formatoDeseado = `${año}-${mes}-${día}T${horas}:${minutos}:${segundos}`;
  return formatoDeseado;
};

const formatearClientes = (clientes) => {
  return clientes.map((cliente) => {
    return {
      label: `${cliente.cliNombre} - ${cliente.cliCodigo}`,
      value: cliente, // Mantén el objeto de cliente completo como valor
    };
  });
};

/*****************************    V-MODEL    ********************************/
const ObtenerDatosEdicion = async (num, selectedYearValue) => {
    //cabecera
    const ord_cab = await ordTrabCabService.getCabById(selectedYearValue, num); 
    const servs = await ordTrabDetSerService.getSerById(num, selectedYearValue);
    const invs = await ordTrabDetInvService.getInvById(num, selectedYearValue);
    const [inventario, cliente, marca, color] = await Promise.all([
        invVehiculoService.dividirInventario(invs),
        clienteService.getClienteById(selectedYearValue, ord_cab.cliCodigo),
        marcaService.getMarcaById(ord_cab.vehmarmodCodigo),
        colorService.getColorById(ord_cab.maecolorCodigo)
    ]);

    const int = inventario.interiores;
    const ext = inventario.exteriores;
    const acs = inventario.accesorios;

    //LLENAR CAMPOS
    calendarValue.value = new Date(ord_cab.ordFecha);
    observaciones.value = ord_cab.ordObsv;
    placa.value = ord_cab.ordPlaca;
    km.value = parseInt(ord_cab.ordKm);
    selectedMarca.value = marca;
    selectedColor.value = color;
    selectedCliente.value = {
        label: `${cliente.cliNombre} - ${cliente.cliCodigo}`,
        value: cliente
    };

    multiselectServicio.value = servs.map(servicio => ({
      serDescrip: servicio.detDescrip,
      serCodigo: servicio.serCodigo
    }));

    actualizarElementos(interior.value, int, ['1', '2',  '3', '21', '22']);
    actualizarElementos(exterior.value, ext, ['23', '24','25','26']);
    actualizarElementos(accesorios.value, acs, []);
    console.log(int);
    console.log(ext);
    console.log(acs);
};

/*****************************    CARGAR PAG    ********************************/
const inicializarDatos = async () => {
    try {
        const [clientes, colores, marcas, servs, interiorData, exteriorData, accesoriosData] = await Promise.all([
            clienteService.getClientes(year),
            colorService.getColores(),
            marcaService.getMarcas(),
            servicioService.getServicios().then(data => multiselectServicios.value = data.map(servicio => ({ serCodigo: servicio.serCodigo, serDescrip: servicio.serDescrip }))),
            invVehiculoService.getInterior(),
            invVehiculoService.getExterior(),
            invVehiculoService.getAccesorios()
        ]);

        autoValueCliente.value = clientes;
        autoValueColor.value = colores;
        autoValueMarca.value = marcas;
        interior.value = interiorData;
        exterior.value = exteriorData;
        accesorios.value = accesoriosData;

        setCanvas();

        if (canvas.value) {
            ctx = canvas.value.getContext('2d');
            ctx.strokeStyle = strokeColor.value;
            ctx.lineWidth = strokeWidth.value;
            canvas.value.addEventListener('mousedown', startDrawing);
            canvas.value.addEventListener('mousemove', draw);
            canvas.value.addEventListener('mouseup', stopDrawing);
            canvas.value.addEventListener('mouseout', stopDrawing);
        }

        if (num && selectedYearValue) {
            await ObtenerDatosEdicion(num, selectedYearValue);
        } else {
            calendarValue.value = new Date(); // Establecer la fecha actual como valor predeterminado
            console.log(calendarValue.value);
        }
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    inicializarDatos();
});

/*****************************    DROPDOWN    ********************************/
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
const obtenerValoresSeleccionados = () => {
  const interioresSeleccionados = interior.value
    .filter(item => item.selected)
    .map(item => ({
      invCodigo: item.invCodigo,
      invDescrip: item.texto || null,
    }));

  const exterioresSeleccionados = exterior.value
    .filter(item => item.selected)
    .map(item => ({
      invCodigo: item.invCodigo,
      invDescrip: item.texto || null,
    }));

  const accesoriosSeleccionados = accesorios.value
    .filter(item => item.selected)
    .map(item => ({
      invCodigo: item.invCodigo,
      invDescrip: item.texto || null,
    }));

  const todosSeleccionados = interioresSeleccionados
    .concat(exterioresSeleccionados, accesoriosSeleccionados);

    return todosSeleccionados;
};

/*****************************    CRUD    ********************************/
const saveOrd = async () => {
    submitted.value = true;
    if (placa.value && selectedCliente.value.value && calendarValue.value) {
        //CABECERA
        const id = await ordTrabCabService.AsignarNumOrd(year);
        const newCab = {
            OrdNumero: id,
            OrdAnio: year,
            OrdFecha: convertirYFormatearFecha(calendarValue.value),
            OrdObsv: observaciones.value,
            CliCodigo: selectedCliente.value.value.cliCodigo,
            CliNombre: selectedCliente.value.value.cliNombre,
            OrdPlaca: placa.value,
            OrdKm: km.value.toString(),
            VehmarmodCodigo: selectedMarca.value.vehmarmodCodigo,
            MaecolorCodigo: selectedColor.value.maecolorCodigo,
        };
        //SERVICIOS
        const valserv = multiselectServicio.value;
        const proxyValues = Object.values(valserv);
        const servs = proxyValues.map(proxyObj => {
            const objetoReal = {
                serCodigo: proxyObj.serCodigo,
                serDescrip: proxyObj.serDescrip
            };
            return objetoReal;
        });
        //INVENTARIO
        const invs =  obtenerValoresSeleccionados();
        console.log(invs);
        invs.forEach(item => {
            item.ordAnio = year;
            item.ordNumero = newCab.OrdNumero;
            item.detInvLinea = 1;
        });
        try {
            const response1 = await ordTrabCabService.createCabOrden(newCab);
            const response2 = await ordTrabDetSerService.createDetServ(newCab.OrdNumero, year, servs);
            const response3 = await ordTrabDetInvService.createDetInv(newCab.OrdNumero, invs);

            router.push({ name: 'ordenTrabajo'}); 
            toast.add({ severity: 'success', summary: 'Exitoso', detail: 'Orden registrada con éxito', life: 3000 });
            
        } catch (error) {
            // Manejar errores de la llamada API
            console.error('Error en la solicitud API:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la orden', life: 3000 });
        }
    }
   else{
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la orden', life: 3000 });
    }
};

/*****************************    CANVAS    ********************************/
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
function getCanvasMousePosition(event) {
  const rect = canvas.value.getBoundingClientRect(); 
  const scaleX = canvas.value.width / rect.width; 
  const scaleY = canvas.value.height / rect.height; 
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  return { x, y };
}
function startDrawing(e) {
  drawing.value = true;
  const { x, y } = getCanvasMousePosition(e);
  [lastX, lastY] = [x, y];
}
function draw(e) {
  if (!drawing.value) return;
  const { x, y } = getCanvasMousePosition(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
}
function stopDrawing() {
  drawing.value = false;
  [lastX, lastY] = [0, 0];
}
const clearDrawings = () => {
  const ctx = canvas.value.getContext('2d');
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  drawImageOnCanvas(ctx, 'demo/images/galleria/galleria11.png', canvas.value.width, canvas.value.height);
};
// Función para convertir el contenido del canvas en una imagen
function canvasToImage(canvas) {
  const image = new Image();
  image.src = canvas.toDataURL(); // Convierte el contenido del canvas en una URL de datos de imagen
  return image;
}
function downloadImage(image, fileName) {
  const link = document.createElement('a');
  link.href = image.src;
  link.download = fileName;
  link.click();
  return link.href; // Devuelve la URL de la imagen descargada
}
const saveDrawing = (id) => {
  const canvasImage = canvasToImage(canvas.value);
  const downloadUrl = downloadImage(canvasImage, `ord_${id}.png`);
  console.log('Imagen guardada en:', downloadUrl);
  return downloadUrl;
};

const generatePDF = () => {
    const element = document.querySelector('.grid'); // selector de clase que engloba tu contenido
            html2canvas(element).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210; // mm (ancho A4)
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save('reporte.pdf');
 });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <div class="section mb-4">
                    <Toolbar>
                    <template v-slot:start>
                        <Button icon="pi pi-arrow-left" class="p-button-secondary mr-4" />
                        <!--- <Button label="Exportar PDF" icon="pi pi-file-pdf" class="p-button-text p-button-info" style="font-size: 1.2em;" @click="generatePDF" />-->
                    </template>
                    <template v-slot:end>
                        <h2 class="noto-sans-font">
                            <i class="pi pi-wrench" style="font-size: 1.8rem; color: #779ecb;"></i>
                           <label> Órden de Trabajo</label>
                        </h2>
                        <div class="section">
                    </div>
                    </template>
                </Toolbar>
                </div>
                <!-- Sección Cliente -->
                <div class="section">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-3 mr-5">
                            <h5>Fecha</h5>
                            <Calendar :showIcon="true" :showButtonBar="true" v-model="calendarValue" :icon="'pi pi-calendar'" ></Calendar>
                        </div>
                        <div class="field col-12 md:col-5 mr-8" >
                            <h5>Cliente</h5>
                            <AutoComplete placeholder="Buscar" id="dd" :dropdown="true" :multiple="false" v-model="selectedCliente" 
                            :suggestions="autoFilteredValueCliente" @complete="BuscarCLiente($event)" field="label" required="true" autofocus :class="{ 'p-invalid': submitted && !selectedCliente }" />
                            <small class="p-invalid" v-if="submitted && !selectedCliente">se requiere Cliente </small>
                        </div>
                        <div class="field col-12 md:col-3">
                            <h5>Tanque de Gasolina</h5>
                            <Knob v-model="knobValue" :step="10" :min="0" :max="100" valueTemplate="{value}%"  valueColor="MediumTurquoise" />
                        </div>
                    </div>
                </div>
                <!-- Sección Datos del Vehículo -->
                <div class="section  mb-4">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-3">
                            <h5>Placa</h5>
                            <InputText v-model="placa" placeholder="AAC-0123" type="text" required="true" autofocus :class="{ 'p-invalid': submitted && !placa }" />
                            <small class="p-invalid" v-if="submitted && !placa">se requiere placa </small>
                        </div>
                        <div class="field col-12 md:col-3">
                            <h5>Color</h5>
                            <AutoComplete placeholder="Buscar" id="dd" :dropdown="true" :multiple="false" v-model="selectedColor" 
                            :suggestions="autoFilteredValueColor" @complete="BuscarColores($event)" field="maecolorDescripcion" required="true" autofocus :class="{ 'p-invalid': submitted && !selectedColor }" />
                            <small class="p-invalid" v-if="submitted && !selectedColor">se requiere Color </small>

                        </div>
                        <div class="field col-12 md:col-3">
                            <h5>Marca</h5>
                            <AutoComplete placeholder="Buscar" id="dd" :dropdown="true" :multiple="false" v-model="selectedMarca" 
                            :suggestions="autoFilteredValueMarca" @complete="BuscarMarcas($event)" field="vehmarmodNombre" required="true" autofocus :class="{ 'p-invalid': submitted && !selectedMarca }"  />
                            <small class="p-invalid" v-if="submitted && !selectedMarca">se requiere Marca </small>
                        </div>
                        <div class="field col-12 md:col-3">
                            <h5>Kilometraje</h5>
                            <InputNumber v-model="km" showButtons mode="decimal" ref="kil" incrementButtonClass="p-button-secondary" decrementButtonClass="p-button-secondary"></InputNumber>
                        </div>
                    </div>
                </div>
                <!-- Sección Inventario -->
                <div class="section mb-3">
                    <h5 class="noto-sans-font">
                            <i class="pi pi-car mr-2" style="font-size: 1.5rem;"></i>
                           <strong>INVENTARIO VEHÍCULO</strong>
                    </h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-4" >
                            <Panel header="INTERIORES" :toggleable="true" class="int">
                                <div v-for="item in interior" :key="item.invCodigo" class="mb-2">
                                    <label>
                                        <input type="checkbox" v-model="item.selected" :value="item.invCodigo">
                                        <label  for="checkbox" class="descrip mr-4">{{item.invDescrip }}</label>
                                        <template v-if="['1', '2',  '3', '21', '22'].includes(item.invCodigo)">
                                            <InputText type="text" v-model="item.texto"  style="padding: 4px; border: 1px solid #ccc; width: 7em;" />
                                        </template>
                                    </label>
                                </div>
                            </Panel>
                        </div>
                        <div class="field col-12 md:col-4">
                            <div class="custom-panel">
                                <Panel header="EXTERIORES" :toggleable="true" class="ext">
                                <div v-for="item in exterior" :key="item.invCodigo" class="mb-2">
                                    <label>
                                        <input type="checkbox" v-model="item.selected" :value="item.invCodigo">
                                        <label for="checkbox" class="descrip mr-4">{{item.invDescrip }}</label>
                                        <template v-if="['23', '24','25','26'].includes(item.invCodigo)">
                                            <InputText type="text" v-model="item.texto" style="padding: 4px; border: 1px solid #ccc; width: 7em;" />
                                        </template>
                                    </label>
                                </div>
                               </Panel>
                            </div>
                        </div>
                        <div class="field col-12 md:col-4">
                            <Panel header="ACCESORIOS" :toggleable="true" class="acs">
                                <div v-for="item in accesorios" :key="item.invCodigo" class="mb-2">
                                    <label>
                                        <input type="checkbox" v-model="item.selected" :value="item.invCodigo">
                                        <label for="checkbox" class="descrip">{{item.invDescrip }}</label>
                                    </label>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
                <!-- Sección Servicios -->
                <div class="section mb-3">
                    <h5 class="noto-sans-font">
                           <i class="pi pi-cog mr-1" style="font-size: 1.4rem; "></i>
                           <strong>SERVICIOS</strong>
                    </h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-11 md:col-12">
                            <MultiSelect v-model="multiselectServicio" :options="multiselectServicios" optionLabel="serDescrip" placeholder="Select Countries" :filter="true"
                            required="true" :class="{ 'p-invalid': submitted && (!multiselectServicio || multiselectServicio.length === 0) }">
                                <template #value="slotProps">
                                    <div class="inline-flex align-items-center py-1 px-2 bg-primary text-primary border-round mr-2" v-for="option of slotProps.value" :key="option.serCodigo">
                                        <div>{{ option.serDescrip }}</div>
                                    </div>
                                    <template v-if="!slotProps.value || slotProps.value.length === 0">
                                        <div class="p-1">Selecciona Servicios</div>
                                    </template>
                                </template>
                                <template #option="slotProps">
                                    <div class="flex align-items-center">
                                        <div>{{ slotProps.option.serDescrip }}</div>
                                    </div>
                                </template>
                            </MultiSelect>
                            <small class="p-invalid" v-if="submitted && (!multiselectServicio || multiselectServicio.length === 0)">Selecciona al menos un servicio</small>
                        </div>
                    </div>
                </div>                
                <!-- Sección Foto -->
                <div class="section mb-3">
                    <h5 class="noto-sans-font">
                            <i class="pi pi-times-circle mr-1" style="font-size: 1.3rem;"></i>
                           <strong>DAÑOS</strong>
                    </h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-1 ">
                            <Button label="Borrar" class="p-button-secondary" @click="clearDrawings" />
                        </div>
                        <div class="field col-12 md:col-6 ">
                            <canvas ref="canvas" style="cursor: pointer;"></canvas>
                        </div>
                    </div>
                </div>
                <!-- Sección Observaciones -->
                <div class="section">
                    <h5 class="noto-sans-font">
                            <i class="pi pi-pencil mr-1" style="font-size: 1.2rem;"></i>
                           <strong>OBSERVACIONES</strong>
                    </h5>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <Textarea id="address" rows="4" v-model="observaciones"/>
                        </div>
                    </div>
                </div>
                <!-- GUARDAR -->
                <div class="section">
                    <div class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <Button label="Guardar" icon="pi pi-check" class="p-button-text p-button-info" style="font-size: 1.2em;" @click="saveOrd" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'); 
</style>
