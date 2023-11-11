import axios from 'axios';
export default class ClienteService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async getClientes(year) {
        try {
        // Realiza la llamada a la API para obtener los clientes del año específico
        const response = await axios.get(`${this.baseUrl}VenMaecliente`, {
            params: { anio: year }
        });

        // Devuelve los datos de clientes obtenidos de la API
        return response.data;
        } catch (error) {
        console.error('Error al obtener los clientes:', error);
        return []; // Devuelve un array vacío en caso de error
        }
    }

    async createCliente(cliente) {
        try {
            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.post(`${this.baseUrl}VenMaecliente`, cliente);

            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            throw new Error('Error al crear el cliente.'); 
        }
    }

    async updateCliente(cliente) {
        try {
            // Realiza la llamada a la API para actualizar el cliente existente
            const response = await axios.put(`${this.baseUrl}VenMaecliente`, cliente);

            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
            throw new Error('Error al actualizar el cliente.'); 
        }
    }

    async deleteCliente(cliente) {
        try {
            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.delete(`${this.baseUrl}VenMaecliente`, { data: cliente });

            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            throw new Error('Error al crear el cliente.'); 
        }
    }    

    async getClienteById(anio, codigo) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}VenMaecliente/${anio}/${codigo}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
    async getClientesFrecs(anio) {
        try {
            const response = await axios.get(`${this.baseUrl}VenMaecliente/ReporteClientesFrecPorAnio?anio=${anio}`);
            console.warn(response.data);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el kardex por ID:', error);
            return []; 
        }
    }
    async getNumeroClientes(year) {
        try {
            // Realiza la llamada a la API para obtener los clientes del año específico
            const response = await axios.get(`${this.baseUrl}VenMaecliente`, {
                params: { anio: year }
            });
    
            // Obtiene los datos de clientes obtenidos de la API
            const clientes = response.data;
    
            // Devuelve el número total de clientes
            return clientes.length;
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
            return 0; // Devuelve 0 en caso de error o si no hay clientes
        }
    }
    async getNumeroClientesMes(year) {
        try {
            // Obtén la fecha actual
            const fechaActual = new Date();
    
            // Obtiene el mes actual en formato 'MM' (por ejemplo, '01' para enero)
            const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    
            // Obtiene el año actual en formato 'YYYY'
            const anioActual = fechaActual.getFullYear().toString();
    
            // Realiza la llamada a la API para obtener órdenes de trabajo del mes actual
            const ordenesResponse = await axios.get(`${this.baseUrl}VenMaecliente`, { params: { anio: anioActual } });
    
            // Obtiene los datos de órdenes de trabajo
            const ordenes = ordenesResponse.data;
    
            // Filtra las órdenes de trabajo para obtener solo las del mes actual
            const ordenesDelMes = ordenes.filter(orden => {
                const fechaOrden = new Date(orden.cliFecing);
                const mesOrden = (fechaOrden.getMonth() + 1).toString().padStart(2, '0');
                const anioOrden = fechaOrden.getFullYear().toString();
    
                return mesOrden === mesActual && anioOrden === anioActual;
            });
    
            // Devuelve el número total de órdenes de trabajo del mes actual
            return ordenesDelMes.length;
        } catch (error) {
            console.error('Error al obtener los datos de órdenes de trabajo:', error);
            return 0; // Devuelve 0 en caso de error o si no hay órdenes
        }
    }     
}
