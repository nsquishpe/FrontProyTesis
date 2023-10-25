import axios from 'axios';
export default class OrdTrabDetSerService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async createDetServ(num, anio, ser) {
        try {
            // Convierte el objeto `ser` a una cadena JSON
            const serJSON = JSON.stringify(ser);

            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.post(`${this.baseUrl}DetOrdServicio`, serJSON, {
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    num: num,
                    anio: anio
                }
            });

            // Devuelve la respuesta de la API en caso de éxito
            console.log("creado");
            return response.data;
        } catch (error) {
            console.error('Error al crear el cliente:', error.response.data);
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

    async deleteDetServ(num, anio) {
        try {
            // Realiza la llamada a la API para eliminar el detalle de inventario
            const response = await axios.delete(`${this.baseUrl}DetOrdServicio`, {
                params: {
                    num: num,
                    anio: anio
                }
            });
    
            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al eliminar el detalle de inventario:', error);
            throw new Error('Error al eliminar el detalle de inventario.');
        }
    }    

    async getSerById(codigo, anio) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}DetOrdServicio/det/${codigo}/${anio}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
}
