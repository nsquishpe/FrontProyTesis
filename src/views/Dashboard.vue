<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import VenEncfacService from '@/service/VenEncfacService';
import { useRouter } from 'vue-router';
import ClienteService from '@/service/ClienteService';
import VehiculoService from '@/service/VehiculoService';
import OrdTrabCabService from '@/service/OrdTrabCabService';

const clienteService = new ClienteService();
const vehiculoService = new VehiculoService();
const ordTrabCabService = new OrdTrabCabService();
const clientes = ref(null);
const marcas = ref(null);
const labels = ref(null);
const valores = ref(null);
const labels2 = ref(null);
const valores2 = ref(null);
const router = useRouter(); 
const venEncfacService = new VenEncfacService();
const year = '2023';
const venEnfacs = ref(null);
const numOrd = ref(null);
const numOrdmes = ref(null);
const numGar = ref(null);
const numGarmes = ref(null);
const numCli = ref(null);
const numClimes = ref(null);

//Select Anios
const years = ref(['2018','2019','2020', '2021', '2022', '2023']); // Lista de años como cadenas
const selectedYear =  ref({ label: '2023', value: '2023' }); // Valor por defecto del select como cadena
const selectedYear2 =  ref({ label: '2023', value: '2023' }); // Valor por defecto del select como cadena
const dropdownYears = years.value.map(year => ({ label: year, value: year }));

const { layoutConfig } = useLayout();
let documentStyle = getComputedStyle(document.documentElement);
let textColor = documentStyle.getPropertyValue('--text-color');
let textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
let surfaceBorder = documentStyle.getPropertyValue('--surface-border');

const pieData = ref(null);
const barData = ref(null);

const pieOptions = ref(null);
const barOptions = ref(null);

const setColorOptions = () => {
    documentStyle = getComputedStyle(document.documentElement);
    textColor = documentStyle.getPropertyValue('--text-color');
    textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    surfaceBorder = documentStyle.getPropertyValue('--surface-border');
};

const setChart = () => {
    barData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Número de Mantenimientos',
                backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                borderColor: documentStyle.getPropertyValue('--primary-500'),
                data: valores
            }
        ]
    };

    barOptions.value = {
        indexAxis: 'y',  // Establecer el eje Y como el eje de índice
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            y: {  // Utilizar el eje Y para los nombres de clientes (etiquetas)
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            x: {  // Utilizar el eje X para el número de facturas (valores)
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            }
        }
    };

    pieData.value = {
        labels: labels2,
        datasets: [
            {
                data: valores2,
                backgroundColor: ['#AED581', '#64B5F6', '#FFB74D', '#9575CD', '#4DB6AC', '#FF8A65', '#7986CB', '#81C784', '#FFD54F', '#BA68C8'], 
                hoverBackgroundColor: ['#8CBF41', '#1E88E5', '#FFA726', '#6A1B9A', '#00897B', '#EF6C00', '#5C6BC0', '#4CAF50', '#FFC107', '#8E24AA']
            }
        ]
    };
    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
};

watch(
    layoutConfig.theme,
    () => {
        setColorOptions();
        setChart();
    },
    { immediate: true }
);


onMounted(() => {
    TraerVenGarantia();
    TraerRankCli();
    TraerRankMarc();
    TraerInfoOrdenes();
    TraerInfoGarantia();
    TraerInfoClientes()
});


const TraerRankCli = async () => {
    const selectedYearValue = selectedYear.value.value; 
    clientes.value = await clienteService.getClientesFrecs(selectedYearValue);

    labels.value = clientes.value.map(cliente => cliente.clI_NOMBRE.toUpperCase());
    valores.value = clientes.value.map(cliente => cliente.numerO_DE_FACTURAS);
};

const TraerRankMarc = async () => {
    const selectedYearValue = selectedYear2.value.value; 
    marcas.value = await vehiculoService.getMarcasRank(selectedYearValue);

    const totalVehiculos = marcas.value.reduce((total, marca) => total + marca.cantidadVehiculosConMarca, 0);
    labels2.value = marcas.value.map(marca => marca.marca.toUpperCase());
    valores2.value = marcas.value.map(marca => Math.round((marca.cantidadVehiculosConMarca / totalVehiculos) * 100));
    // Asegurar que la suma total de valores sea 100
    const sumaValores = valores2.value.reduce((total, valor) => total + valor, 0);
    const diferencia = 100 - sumaValores;
    // Si hay una diferencia, ajustar el primer valor para que la suma total sea 100
    if (diferencia !== 0) {
        valores2.value[0] += diferencia;
    }
    console.log(labels2.value, valores2.value);
};

const TraerVenGarantia = async () => {
    venEnfacs.value = await venEncfacService.ConsultaGarantia(year);
    // Formatear las fechas 
    venEnfacs.value = venEnfacs.value.map(fac => {
        if (fac.encfacFechaemision) {
            const fecha = new Date(fac.encfacFechaemision);
            fac.encfacFechaemision = fecha.toLocaleDateString(); // Formatea la fecha como 'MM/DD/YYYY' o 'DD/MM/YYYY' dependiendo del idioma del navegador
        }
        return fac;
    });
    console.log(venEnfacs.value);
};

const TraerInfoOrdenes = async () => {
    numOrd.value = await ordTrabCabService.getNumeroOrdenes('2023');
    numOrdmes.value = await ordTrabCabService.getNumeroOrdenesDelMes();
};

const TraerInfoGarantia = async () => {
    numGar.value = await venEncfacService.getNumeroGarantia('2023');
    numGarmes.value = await venEncfacService.getNumeroGarantiaMes('2023');
};

const TraerInfoClientes = async () => {
    numCli.value = await venEncfacService.contarVentasUnicas('2023');
    numClimes.value = await clienteService.getNumeroClientesMes('2023');
};

const goToVenDetfac = (anio, encfacNumero, vhcspcfPlaca) => {
  // Navegar a la página VenDetfac con parámetros
  router.push({ name: 'venDetfac', params: { anio, encfacNumero, vhcspcfPlaca } });
};


</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-700 font-medium mb-3">Total Órdenes de Trabajo</span>
                        <div class="text-900 font-medium text-xl">{{ numOrd }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-wrench text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{numOrdmes}} nuevos</span>
                <span class="text-600"> este mes</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-700 font-medium mb-3">Total de Garantías Otorgadas</span>
                        <div class="text-900 font-medium text-xl">{{numGar}}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-verified text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{numGarmes}} nuevos</span>
                <span class="text-600"> este mes</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-700 font-medium mb-3">Total de Clientes - 2023</span>
                        <div class="text-900 font-medium text-xl">{{numCli}}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{numClimes }} nuevos</span>
                <span class="text-600"> este mes</span>
            </div>
        </div>

        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Retornos de vehículos por garantía</h5>
                <DataTable :value="venEnfacs" :rows="4" :paginator="true" responsiveLayout="scroll">
                    <Column field="encfacNumero" header="Número" :sortable="true" style="width: 25%"></Column>
                    <Column field="vhcspcfPlaca" header="Placa" :sortable="false" style="width: 25%"></Column>
                    <Column field="encfacObsgarantia" header="Observación" :sortable="false" style="width: 45%"></Column>
                    <Column style="width: 15%">
                        <template #header> Ver </template>
                        <template  #body="slotProps">
                            <Button icon="pi pi-search" type="button" class="p-button-text" @click="goToVenDetfac(year, slotProps.data.encfacNumero, slotProps.data.vhcspcfPlaca)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card flex flex-column align-items-center">
                <h5 class="text-left w-full ">Ranking Marcas</h5>
                <div class="text-left w-full ">
                    <label for="dropdownYears" style="font-weight: bold;color: black;font-size: 1.05em;" class="mr-1">Periodo: </label>
                    <Dropdown v-model="selectedYear2" :options="dropdownYears" optionLabel="label" placeholder="Año" @focus="TraerRankMarc"  />
                </div>
                <Chart type="doughnut" :data="pieData" :options="pieOptions" style="width: 62%; height: 62%;"></Chart>
            </div>
        </div>
        <div class="col-12 xl:col-7">
            <div class="card">
                <h5>Clientes más frecuentes</h5>
                <label for="dropdownYears" style="font-weight: bold;color: black;font-size: 1.05em;" class="mr-1">Periodo: </label>
                <Dropdown v-model="selectedYear" :options="dropdownYears" optionLabel="label" placeholder="Año" @focus="TraerRankCli" />
                <Chart type="bar" :data="barData" :options="barOptions"></Chart>
            </div>
        </div>
    </div>
</template>
