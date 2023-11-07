import axios from 'axios';
export default class VehiculoService {

    baseUrl = 'http://localhost/BackProyTesis/api/';

    async getVehiculo(anio, vhcspcfPlaca, encfacNumero) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}VenVhcspcf/${anio}/${vhcspcfPlaca}/${encfacNumero}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
    async getMarcasRank(anio) {
        try {
            const response = await axios.get(`${this.baseUrl}VenVhcspcf/ReporteRankMarcas?anio=${anio}`);
            console.warn(response.data);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el kardex por ID:', error);
            return []; 
        }
    }
}
