import axios from 'axios';
export default class VenDetfacService {

    baseUrl = 'http://localhost/BackProyTesis/api/';
    
    async getDetalles(anio, encfacNumero) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}VenDetfac/${anio}/${encfacNumero}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
}
