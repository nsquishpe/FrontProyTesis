<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount,watch } from 'vue';
import VenEncfacService from '@/service/VenEncfacService';
import ClienteService from '@/service/ClienteService';
import { useRouter } from 'vue-router'; // Importa useRouter de vue-router
import { useToast } from 'primevue/usetoast';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

const toast = useToast();
const router = useRouter(); // Obtén el objeto router
const showTextarea = ref(false);

const clientes = ref(null);
const facs = ref (null);
const dt = ref(null);
const filters = ref({});
const display = ref(false);
const calendarValueaIni = ref(new Date());
const calendarValueFin = ref(null);
const minEndDate = ref(null);
const reporteGeneral = ref(null);
const reportePorCliente = ref(null);
//Manejo Clientes
const selectedCliente = ref(null);
const autoValueCliente = ref(null);
const autoFilteredValueCliente = ref([]);


const venEncfacService = new VenEncfacService();
const clienteService = new ClienteService();

const encfac = ref({
    encfacNumero: '',
    cliNombre: '',
    cliCodigo: '',
    cliNombre: '',
    encfacFechaemision: '',
    encfacTotal: '',
    vhcspcfPlaca: '',
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
    cargarClientes();
});

const goToVenDetfac = (anio, encfacNumero, vhcspcfPlaca) => {
  anio = anio.value; 
  // Navegar a la página VenDetfac con parámetros
  if (vhcspcfPlaca == null){
    vhcspcfPlaca = 'No registrado';
  }
  router.push({ name: 'venDetfac', params: { anio, encfacNumero, vhcspcfPlaca } });
};


// Función para refrescar los clientes con el año seleccionado
const RefreshClientes = async () => {
    const selectedYearValue = selectedYear.value.value; 
    clientes.value = await venEncfacService.modeloAuto(selectedYearValue);
    // Formatear las fechas en cada objeto dentro de clientes.value utilizando map
    clientes.value = clientes.value.map(cliente => {
        if (cliente.encfacFechaemision) {
            const fecha = new Date(cliente.encfacFechaemision);
            cliente.encfacFechaemision = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
        }
        return cliente;
    });
};

const cargarClientes = async () => {
  try {
    const selectedYearValue = selectedYear.value.value; 
    autoValueCliente.value = await clienteService.getClientes(selectedYearValue);
  } catch (error) {
    console.error(error);
  }
};

const open = () => {
    display.value = true;
};

const close = async () => {
    if(selectedCliente.value != null){
        const cliente = selectedCliente.value.value.cliCodigo;
        reportePorCliente.value = await venEncfacService.getReportePorCliente(formatDate(calendarValueaIni.value), formatDate(calendarValueFin.value), cliente);
        if(reportePorCliente.value.length == 0){
            toast.add({ severity: 'error', summary: 'Error', detail: 'Cliente no registra facturas en las fechas indicadas.', life: 3000 });
        }
        else{
            // Formatear las fechas
            reportePorCliente.value = reportePorCliente.value.map(fac => {
                if (fac.encfaC_FECHAEMISION) {
                    const fecha = new Date(fac.encfaC_FECHAEMISION);
                    fac.encfaC_FECHAEMISION = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
                }
                return fac;
            });
            generatePDF(reportePorCliente.value, cliente)
        }
    }
    else{
        reporteGeneral.value = await venEncfacService.getReporteGeneral(formatDate(calendarValueaIni.value), formatDate(calendarValueFin.value));
        if(reporteGeneral.value.length == 0){
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se encontraron ventas registradas en las fechas indicadas.', life: 3000 });
        }
        else{
            // Formatear las fechas
            reporteGeneral.value = reporteGeneral.value.map(fac => {
                if (fac.encfaC_FECHAEMISION) {
                    const fecha = new Date(fac.encfaC_FECHAEMISION);
                    fac.encfaC_FECHAEMISION = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
                }
                return fac;
            });
            generatePDF(reporteGeneral.value)
        }
    }
    display.value = false;
};

/*****************************    REPORTE    ********************************/
const generatePDF = (items, cli = null) => {
    const doc = new jsPDF({
        orientation: 'landscape', // Establecer orientación horizontal
        unit: 'mm',
        format: [297, 210], // Tamaño de página A4 en orientación horizontal (puedes ajustarlo según tus necesidades)
        margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Ajustar márgenes
    });

    // Logo de la empresa (ajustar tamaño)
    const logo = '/demo/images/login/Logo.png'; // Ruta al logo
    const logoWidth = 50; // Ancho del logo ajustado
    const logoHeight = (logoWidth * 20) / 70; // Proporción del logo
    doc.addImage(logo, 'PNG', 20, 10, logoWidth, logoHeight);

    // Fecha y hora de emisión (alineado a la derecha del logo)
    const currentDateTime = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(currentDateTime, doc.internal.pageSize.getWidth() - 20, 20, 'right');

    // Título del reporte (centrado)
    doc.setFontSize(16);
    doc.setTextColor(26, 42, 99);
    doc.text('FACTURAS EMITIDAS', doc.internal.pageSize.getWidth() / 2, 35, 'center');

    // Fechas (centradas)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const dateText = `Desde: ${formatDate(calendarValueaIni.value)}  Hasta: ${formatDate(calendarValueFin.value)}`;
    const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const startX = (doc.internal.pageSize.getWidth() - dateTextWidth) / 2;
    doc.text(dateText, startX, 45);

    // Calcular el total
    const total = items.reduce((acc, item) => acc + item.total, 0);

    // Encabezado de la tabla
    const tableHeaders = [['Factura Nro.', 'Cliente', 'Código', 'Fecha', 'Estado', 'Subtotal','Iva','Total']];

    // Contenido de la tabla
    const tableData = items.map(item => [item.encfaC_REFERENCIA, item.clI_NOMBRE, item.clI_CODIGO, item.encfaC_FECHAEMISION, item.encfaC_ESTADO, item.subtotal, item.iva, item.total  ]);

    // Generar la tabla
    doc.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: 55,
    styles: {
        cellPadding: 2,
        fontSize: 10,
        valign: 'middle',
        halign: 'center',
    },
    columnStyles: {
        0: { halign: 'left' },
    },
    headStyles: {
        fillColor: [190, 223, 251],
        textColor: [0, 0, 0],
    },
    margin: { top: 30 }, // Ajustar el margen superior para evitar que la tabla se corte
    });

    // Mostrar la suma de la columna "Total" debajo de la tabla

    doc.setFontSize(12);
    doc.text(`Total: ${total}`, 250, doc.lastAutoTable.finalY + 10);

     // Guardar el PDF con un nombre específico 
    const fileName = cli ? `Report-${cli}-${formatDate(calendarValueaIni.value)}-${formatDate(calendarValueFin.value)}-Ventas.pdf` : `Report-${formatDate(calendarValueaIni.value)}-${formatDate(calendarValueFin.value)}-Ventas.pdf`;
    doc.save(fileName);
};

/*****************************    AUXILIARES    ********************************/
watch(calendarValueaIni, () => {
  if (calendarValueaIni.value) {
    const minDate = new Date(calendarValueaIni.value);
    minDate.setDate(minDate.getDate() + 1);
    minEndDate.value = minDate;
  }
});

function validateEndDate(selectedDate) {
  if (calendarValueaIni.value && selectedDate < minEndDate.value) {
    // Muestra un mensaje de error si la fecha fin es menor que la fecha de inicio
    console.error('La fecha fin debe ser al menos un día después de la fecha de inicio');
    calendarValueFin.value = null;
  }
}
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

const formatDate = (date) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
  const [day, month, year] = formattedDate.split('/');
  return `${day}/${month}/${year}`;
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2" style="text-align: center;">
                            <label for="dropdownYears" style="font-weight: bold;color: black;font-size: 1.05em;" class="mr-1">PERIODO: </label>
                            <Dropdown v-model="selectedYear" :options="dropdownYears" optionLabel="label" placeholder="Año" @focus="RefreshClientes" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Dialog header="REPORTE FACTURAS EMITIDAS" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" :modal="true">
                                <div class="container mt-3">
                                    <div class="d-flex align-items-center mb-3">
                                        <label style="font-weight: bold; font-size: medium;" class="mr-4">Fecha Inicio:</label>
                                        <Calendar :showIcon="true" :showButtonBar="true" v-model="calendarValueaIni" :icon="'pi pi-calendar'"></Calendar>
                                    </div>
                                    <div class="d-flex align-items-center mb-3">
                                        <label style="font-weight: bold; font-size: medium;" class="mr-6">Fecha Fin:</label>
                                        <Calendar :showIcon="true" :showButtonBar="true" v-model="calendarValueFin" :icon="'pi pi-calendar'" :minDate="minEndDate" @date-select="validateEndDate"></Calendar>
                                    </div>
                                    <div class="form-group">
                                        <label style="font-weight: bold; font-size: medium;" class="mr-7">Cliente: </label>
                                        <AutoComplete placeholder="General" id="dd" :dropdown="true" :multiple="false" v-model="selectedCliente" 
                                        :suggestions="autoFilteredValueCliente" @complete="BuscarCLiente($event)" field="label" autofocus />
                                    </div>
                                </div>
                                <template #footer>
                                    <Button label="Generar Reporte" @click="close" class="p-button-success" />
                                </template>
                        </Dialog>
                        <Button label="REPORTES" icon="pi pi-file-pdf" class="p-button" style="width: auto" @click="open" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="clientes"
                    :dataKey="encfac.encfacNumero"
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
                            <h4 class="noto-sans-font">
                                <i class="pi pi-fw pi-calculator mr-3" style="font-size: 1.8rem; color: #779ecb;"></i>
                                <label>Administrar Ventas</label>
                            </h4>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column field="encfacNumero" header="NÚMERO" :sortable="false" headerStyle="width:14%; min-width:10rem; ">
                        <template #body="slotProps">
                            <span class="p-column-title">Num</span>
                            {{ slotProps.data.encfacNumero }}
                        </template>
                    </Column>
                    <Column field="cliNombre" header="NOMBRE" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.cliNombre }}
                        </template>
                    </Column>
                    <Column field="cliCodigo" header="CÓDIGO" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.cliCodigo }}
                        </template>
                    </Column>
                    <Column field="vhcspcfPlaca" header="PLACA" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.vhcspcfPlaca }}
                        </template>
                    </Column>
                    <Column field="encfacFechaemision" header="FECHA" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Cod</span>
                            {{ slotProps.data.encfacFechaemision }}
                        </template>
                    </Column>
                    <Column field="encfacTotal" header="TOTAL" :sortable="false" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">tot</span>
                            {{ formatCurrency(slotProps.data.encfacTotal) }}
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #header> VISUALIZAR </template>
                        <template #body="slotProps">
                            <ConfirmPopup></ConfirmPopup>
                            <Button icon="pi pi-search" type="button" class="p-button-rounded p-button mr-2" style="background-color: #2e78ba;" @click="goToVenDetfac(selectedYear, slotProps.data.encfacNumero, slotProps.data.vhcspcfPlaca)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
.smile-button {
    padding: 0.8rem 1.4rem;
    background-image: url('/demo/images/login/smile.png');
    background-size: 2rem 1.8rem; /* Establece el tamaño de la imagen de fondo */
    background-repeat: no-repeat; /* Evita la repetición de la imagen */
    background-position: center center; /* Centra la imagen en el botón */
}
</style>