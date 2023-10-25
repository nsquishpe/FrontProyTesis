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
    async getMarcaById(vehmarmodCodigo) {
        try {
            const marcas = await this.getMarcas();
            const marcaEncontrada = marcas.find(marca => marca.vehmarmodCodigo === vehmarmodCodigo);
            return marcaEncontrada;
        } catch (error) {
            console.error('Error al obtener la marca por ID:', error);
            throw error; // Lanza el error para que sea manejado por el código que llama a este método
        }
    }
}
