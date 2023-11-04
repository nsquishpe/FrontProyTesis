<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch  } from 'vue';
import InvMaeGrupoService from '@/service/InvMaeGrupoService';
import ArticuloService from '@/service/ArticuloService';
import { useRouter } from 'vue-router'; // Importa useRouter de vue-router
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

const router = useRouter(); // Obtén el objeto router
const dt = ref(null);
const filters = ref({});
const reporteGeneral = ref(null);
const reportePorGrupo = ref(null);
const invMaeGrupoService = new InvMaeGrupoService();
const articuloService = new ArticuloService();
const display = ref(false);
const calendarValue = ref(new Date());

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
const selectedCategoriaReport = ref(null);

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

const open = () => {
    display.value = true;
};

const close = async () => {
    const selectedYearValue = selectedYear.value.value; 
    console.log(formatDate(calendarValue.value),selectedYearValue );
    if(selectedCategoriaReport.value != null){
        const grupo = selectedCategoriaReport.value.value;
        reportePorGrupo.value = await articuloService.getReportePorGrupo(selectedYearValue, 'B001', formatDate(calendarValue.value), grupo);
        generatePDF(reportePorGrupo.value);
    }
    else{
        reporteGeneral.value = await articuloService.getReporteGeneral(selectedYearValue, 'B001', formatDate(calendarValue.value));
        generatePDF(reporteGeneral.value);
    }
    display.value = false;
};


/*****************************    REPORTE    ********************************/
const generatePDF = (items) => {
  const doc = new jsPDF();

   // Logo de la empresa (ajustar tamaño)
   const logo = '/demo/images/login/Logo.png'; // Ruta al logo
   const logoWidth = 50; // Ancho del logo ajustado
   const logoHeight = (logoWidth * 20) / 70; // Proporción del logo
   doc.addImage(logo, 'PNG', 20, 10, logoWidth, logoHeight);

  // Título del reporte
  doc.setFontSize(16);
  doc.setTextColor(26, 42, 99); // Color del encabezado
  doc.text('EXISTENCIA - PRECIOS', doc.internal.pageSize.getWidth() / 2, 35, 'center');
  
  // Fecha de corte
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Color del texto normal
  doc.text(`Fecha de Corte: ${formatDate(calendarValue.value)}`, doc.internal.pageSize.getWidth() / 2, 40, 'center');

  
   // Agrupar los elementos por descripción
   const groupedItems = {};
  items.forEach(item => {
    if (!groupedItems[item.grupo]) {
      groupedItems[item.grupo] = [];
    }
    groupedItems[item.grupo].push(item);
  });

  // Posición inicial de la tabla
  let startY = 45;

  let groupName = '';
    if (Object.keys(groupedItems).length === 1) {
    groupName = Object.keys(groupedItems)[0];
    }

  Object.keys(groupedItems).forEach(grupo => {
    // Encabezado de la tabla
    doc.setFontSize(10); // Reducir el tamaño del texto
    doc.setTextColor(0, 0, 0);
    doc.text(grupo, doc.internal.pageSize.getWidth() / 2, startY + 5, 'center'); // Ajustar la posición del texto

    // Contenido de la tabla
    doc.autoTable({
      head: [['Código', 'Nombre', 'Existencia', 'Neto','PVP' ]],
      body: groupedItems[grupo].map(item => [item.arT_CODIGO, item.arT_NOMBRE, item.existencia, item.arT_PRECIOSIVA, item.arT_PRECIOCIVA]),
      startY: startY + 10, // Ajusta el espacio superior según tus necesidades
      styles: {
        cellPadding: 2,
        fontSize: 10, // Reducir el tamaño del texto de la tabla
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
    });

    // Actualizar la posición inicial para la siguiente tabla
    startY = doc.autoTable.previous.finalY + 5; // Reducir el espacio entre las tablas
  });

  console.log(groupedItems);

  // Guardar el PDF con un nombre específico 
  const formattedDate = formatDate(calendarValue.value);
  const fileName = groupName ? `Report-${groupName}-${formattedDate}-B001.pdf` : `Report-${formattedDate}-B001.pdf`;
  doc.save(fileName);
};


/*****************************    AUXILIARES    ********************************/
const formatDate = (date) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
  const [day, month, year] = formattedDate.split('/');
  return `${day}/${month}/${year}`;
};

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
                            <Dropdown v-model="selectedCategoria" :options="dropdownCategorias" optionLabel="label" placeholder="Año" @focus="RefreshProductos"  class="mr-4" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Dialog header="REPORTE EXISTENCIA B001" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '33vw' }" :modal="true">
                                <div class="container mt-3">
                                    <div class="d-flex align-items-center mb-3">
                                        <label style="font-weight: bold; font-size: medium;" class="mr-4">Fecha Corte:</label>
                                        <Calendar :showIcon="true" :showButtonBar="true" v-model="calendarValue" :icon="'pi pi-calendar'"></Calendar>
                                    </div>
                                    <div class="form-group">
                                        <label style="font-weight: bold; font-size: medium;" class="mr-7">Grupo: </label>
                                        <Dropdown v-model="selectedCategoriaReport" :options="dropdownCategorias" optionLabel="label" placeholder="General"  class="mr-4" />
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
                            <h4 class="noto-sans-font">
                                <i class="pi pi-fw pi-folder mr-3" style="font-size: 1.8rem; color: #779ecb;"></i>
                                <label>Administrar Inventario</label>
                            </h4>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </span>
                        </div>
                    </template>

                    <Column field="artCodigo" header="CÓDIGO" :sortable="true" headerStyle="width:8%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.artCodigo }}
                        </template>
                    </Column>
                    <Column field="artNombre" header="DESCRIPCIÓN" :sortable="true" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.artNombre }}
                        </template>
                    </Column>
                    <Column field="grupNombre" header="CATEGORÍA" :sortable="true" headerStyle="width:8%; min-width:8rem;">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.grupNombre) }}
                        </template>
                    </Column>
                    <Column field="precio" header="PRECIO" :sortable="true" headerStyle="width:8%; min-width:8rem;">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.precio) }}
                        </template>
                    </Column>
                    <Column field="stock" header="STOCK" :sortable="true" headerStyle="width:8%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.stock }}
                        </template>
                    </Column>
                    <Column field="inventoryStatus" header="STATUS" :sortable="true" headerStyle="width:8%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <span :class="'product-badge status-' + (slotProps.data.inventoryStatus ? slotProps.data.inventoryStatus.toLowerCase() : '')">{{ slotProps.data.inventoryStatus }}</span>
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #header> VISUALIZAR </template>
                        <template #body="slotProps">
                            <Button icon="pi pi-search" type="button"  class="p-button-rounded p-button mr-2" style="background-color: #2e78ba;" @click="goDetalleKardex(selectedYear, slotProps.data.artCodigo, slotProps.data.artNombre, slotProps.data.stock)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>