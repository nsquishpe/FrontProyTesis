import axios from 'axios';
export default class OrdTrabDetInvService {

    baseUrl = 'http://localhost/BackProyTesis/api/';

    async createDetInv(num, inv) {
        try {
            // Convierte el objeto `ser` a una cadena JSON
            const serJSON = JSON.stringify(inv);

            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.post(`${this.baseUrl}DetOrdInventario`, serJSON, {
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    num: num
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
    
    async updateDetInv(num, inv) {
        try {
            // Convierte el objeto `ser` a una cadena JSON
            const serJSON = JSON.stringify(inv);

            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.put(`${this.baseUrl}DetOrdInventario`, serJSON, {
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    num: num
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

    async deleteDetInv(num, anio) {
        try {
            // Realiza la llamada a la API para eliminar el detalle de inventario
            const response = await axios.delete(`${this.baseUrl}DetOrdInventario`, {
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

    async getInvById(codigo, anio) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}DetOrdInventario/det/${codigo}/${anio}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
}
