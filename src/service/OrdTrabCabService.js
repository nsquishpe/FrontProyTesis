import axios from 'axios';
export default class OrdTrabCabService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async getOrdenes(year) {
        try {
        // Realiza la llamada a la API para obtener los clientes del año específico
        const response = await axios.get(`${this.baseUrl}CabOrdenTrabajo`, {
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
}
