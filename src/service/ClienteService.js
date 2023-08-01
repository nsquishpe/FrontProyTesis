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
}
