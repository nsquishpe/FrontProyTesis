import axios from 'axios';
export default class MarcaService {

    baseUrl = 'http://localhost/BackProyTesis/api/';

    async getMarcas() {
        try {
        const response = await axios.get(`${this.baseUrl}VenVehmarmod`);
        return response.data;
        } catch (error) {
        console.error('Error al obtener las marcas:', error);
        return []; // Devuelve un array vacío en caso de error
        }
    }
}
