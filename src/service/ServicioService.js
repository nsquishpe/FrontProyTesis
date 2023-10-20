import axios from 'axios';
export default class ServicioService {

    baseUrl = 'http://localhost/BackProyTesis/api/';

    async getServicios() {
        try {
        const response = await axios.get(`${this.baseUrl}Servicio`);
        return response.data;
        } catch (error) {
        console.error('Error al obtener las marcas:', error);
        return []; // Devuelve un array vacío en caso de error
        }
    }
}
