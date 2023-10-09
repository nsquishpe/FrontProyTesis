import axios from 'axios';
export default class KardexService {

    baseUrl = 'http://localhost/BackProyTesis/api/';
    
    async getEntradas(anio, cod) {
        try {
            // Realiza la llamada a la API para obtener el kardex por su año y código
            const response = await axios.get(`${this.baseUrl}InvTrnkardex/en/${anio}/${cod}`);
            console.warn(response);
            // Devuelve el kardex obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el kardex por ID:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
    async getSalidas(anio, cod) {
        try {
            // Realiza la llamada a la API para obtener el kardex por su año y código
            const response = await axios.get(`${this.baseUrl}InvTrnkardex/sa/${anio}/${cod}`);
            console.warn(response);
            // Devuelve el kardex obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el kardex por ID:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
}