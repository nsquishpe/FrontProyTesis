import axios from 'axios';
export default class ClienteService {

    baseUrl = 'http://localhost/BackProyTesis/api/';

    async modeloAuto(year) {
        try {
            // Realiza la llamada a la API para obtener los datos de VenEncfac
            const venEncfacResponse = await axios.get(`${this.baseUrl}VenEncfac`, {
                params: { anio: year }
            });
    
            const venEncfacData = venEncfacResponse.data;
    
            if (venEncfacData.length === 0) {
                return [];
            }
    
            // Crea un array de promesas para las llamadas a VenVhcspcf en paralelo
            const promises = venEncfacData.map((venEncfac) =>
                axios.get(`${this.baseUrl}VenVhcspcf/fac/${year}/${venEncfac.encfacNumero}`)
                    .then((response) => {
                        const venVhcspcfData = response.data;
                        venEncfac.vhcspcfPlaca = venVhcspcfData.vhcspcfPlaca;
                        return venEncfac;
                    })
            );
    
            // Ejecuta todas las promesas en paralelo y espera su resolución con Promise.all
            const combinedData = await Promise.all(promises);
    
            return combinedData;
        } catch (error) {
            console.error('Error al combinar los datos:', error);
            throw error;
        }
    }    
    
    async getVenEncfacById(anio, codigo) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}VenEncfac/num/${anio}/${codigo}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener la venta cabecera:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
    async updateVenEncfac(fac) {
        try {
            const response = await axios.put(`${this.baseUrl}VenEncfac`, fac);
            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
            throw new Error('Error al actualizar el cliente.'); 
        }
    }
    async ConsultaGarantia(year) {
        try {
            // Realiza la llamada a la API para obtener los datos de VenEncfac
            const venEncfacResponse = await axios.get(`${this.baseUrl}VenEncfac`, {
                params: { anio: year }
            });
    
            const venEncfacData = venEncfacResponse.data;
    
            if (venEncfacData.length === 0) {
                return [];
            }
    
            // Filtra los datos que cumplen con la condición venEncfac.EncfacGarantia = '1'
            const filteredVenEncfacData = venEncfacData.filter((venEncfac) => venEncfac.encfacGarantia === '1');
    
            // Crea un array de promesas para las llamadas a VenVhcspcf en paralelo usando los datos filtrados
            const promises = filteredVenEncfacData.map((venEncfac) =>
                axios.get(`${this.baseUrl}VenVhcspcf/fac/${year}/${venEncfac.encfacNumero}`)
                    .then((response) => {
                        const venVhcspcfData = response.data;
                        venEncfac.vhcspcfPlaca = venVhcspcfData.vhcspcfPlaca;
                        return venEncfac;
                    })
            );
    
            // Ejecuta todas las promesas en paralelo y espera su resolución con Promise.all
            const combinedData = await Promise.all(promises);
    
            return combinedData;
        } catch (error) {
            console.error('Error al combinar los datos:', error);
            throw error;
        }
    }
    async getNumeroGarantia(year) {
        try {
            // Realiza la llamada a la API para obtener los datos de VenEncfac
            const venEncfacResponse = await axios.get(`${this.baseUrl}VenEncfac`, {
                params: { anio: year }
            });
    
            const venEncfacData = venEncfacResponse.data;
    
            if (venEncfacData.length === 0) {
                return 0; // No hay órdenes de trabajo con garantía
            }
    
            // Filtra los datos que cumplen con la condición venEncfac.EncfacGarantia = '1'
            const ordenesConGarantia = venEncfacData.filter((venEncfac) => venEncfac.encfacGarantia === '1');
    
            // Devuelve el número total de órdenes de trabajo con garantía
            return ordenesConGarantia.length;
        } catch (error) {
            console.error('Error al obtener los datos de órdenes de trabajo con garantía:', error);
            throw error;
        }
    } 
    async getNumeroGarantiaMes(year) {
        try {
            // Obtén la fecha actual
            const fechaActual = new Date();
    
            // Realiza la llamada a la API para obtener los datos de VenEncfac
            const venEncfacResponse = await axios.get(`${this.baseUrl}VenEncfac`, {
                params: { anio: year }
            });
    
            const venEncfacData = venEncfacResponse.data;
    
            if (venEncfacData.length === 0) {
                return 0; // No hay órdenes de trabajo con garantía
            }
    
            // Filtra los datos que cumplen con la condición venEncfac.EncfacGarantia = '1'
            const ordenesConGarantia = venEncfacData.filter((venEncfac) => 
                venEncfac.encfacGarantia === '1' && 
                new Date(venEncfac.encfacFechaautFe).getMonth() === fechaActual.getMonth()
            );
    
            // Devuelve el número total de órdenes de trabajo con garantía del mes actual
            return ordenesConGarantia.length;
        } catch (error) {
            console.error('Error al obtener los datos de órdenes de trabajo con garantía:', error);
            throw error;
        }
    }       
    async getReporteGeneral(fechaInicio, fechaFin) {
        try {
          const response = await axios.get(`${this.baseUrl}VenEncfac/ReporteGeneral?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
          const data = response.data.map(item => {
            if (item.encfaC_ESTADO === 'P') {
              item.encfaC_ESTADO = 'PENDIENTE';
            } else {
              item.encfaC_ESTADO = 'PAGADO';
            }
            return item;
          });
          console.warn(data);
          return data;
        } catch (error) {
          console.error('Error al obtener el kardex por ID:', error);
          return []; 
        }
    }      
    async getReportePorCliente(fechaInicio, fechaFin, cliente) {
        try {
            const response = await axios.get(`${this.baseUrl}VenEncfac/ReportePorCliente?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&clienteCodigo=${cliente}`);
            const data = response.data.map(item => {
            if (item.encfaC_ESTADO === 'P') {
                item.encfaC_ESTADO = 'PENDIENTE';
            } else {
              item.encfaC_ESTADO = 'PAGADO';
            }
                return item;
            });
            console.warn(data);
            return data;
        } catch (error) {
            console.error('Error al obtener el kardex por ID:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
    async contarVentasUnicas(year) {
        try {
            // Realiza la llamada a la API para obtener los datos de VenEncfac
            const venEncfacResponse = await axios.get(`${this.baseUrl}VenEncfac`, {
                params: { anio: year }
            });
    
            const venEncfacData = venEncfacResponse.data;
    
            if (venEncfacData.length === 0) {
                return 0;  // Retorna directamente el total de clientes
            }
    
            // Crear un conjunto para mantener un registro de los clientes únicos
            const clientesUnicos = new Set();
    
            // Iterar sobre los datos de VenEncfac y agregar CliCodigo al conjunto
            venEncfacData.forEach((venEncfac) => {
                clientesUnicos.add(venEncfac.cliCodigo);
            });
    
            // Devuelve el total de clientes
            return clientesUnicos.size;
        } catch (error) {
            console.error('Error al obtener los datos de VenEncfac:', error);
            throw error;
        }
    }
    
    
}
