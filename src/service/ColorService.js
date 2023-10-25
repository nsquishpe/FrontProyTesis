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
    async getColorById(maecolorCodigo) {
        try {
            const colores = await this.getColores();
            const colorEncontrado = colores.find(color => color.maecolorCodigo === maecolorCodigo);
            return colorEncontrado;
        } catch (error) {
            console.error('Error al obtener la marca por ID:', error);
            throw error; // Lanza el error para que sea manejado por el código que llama a este método
        }
    }
}
