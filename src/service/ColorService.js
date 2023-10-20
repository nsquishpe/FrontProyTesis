import axios from 'axios';
export default class ColorService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async getColores(year) {
        try {
        // Realiza la llamada a la API para obtener los clientes del año específico
        const response = await axios.get(`${this.baseUrl}VenMaecolor`);
        return response.data;
        } catch (error) {
        console.error('Error al obtener los clientes:', error);
        return []; // Devuelve un array vacío en caso de error
        }
    }
}
