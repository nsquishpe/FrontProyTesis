import axios from 'axios';
export default class UsuarioService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async getUsuAdministrador(usu, token) {
        try {
        // Realiza la llamada a la API 
        const response = await axios.get(`${this.baseUrl}SegMaeusuario`, {
            params: { usu: usu, token: token }
        });

        // Devuelve los datos de administrador obtenidos de la API
        return response.data;
        } catch (error) {
        console.error('Error al obtener usuario', error);
        return []; // Devuelve un array vacío en caso de error
        }
    }
}
