import axios from 'axios';
export default class InvVehiculoService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async getInterior() {
        try {
            // Realiza la llamada a la API para obtener todos los objetos
            const response = await axios.get(`${this.baseUrl}InvVehiculo`);
            const objetosFiltrados = response.data.filter(objeto => {
                const invCodigoInt = parseInt(objeto.invCodigo, 10);
                return invCodigoInt >= 1 && invCodigoInt <= 14;
            });
            return objetosFiltrados;
        } catch (error) {
            console.error('Error al obtener los objetos:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
    async getExterior() {
        try {
            // Realiza la llamada a la API para obtener todos los objetos
            const response = await axios.get(`${this.baseUrl}InvVehiculo`);
            const objetosFiltrados = response.data.filter(objeto => {
                const invCodigoInt = parseInt(objeto.invCodigo, 10);
                return invCodigoInt >= 15 && invCodigoInt <= 23;
            });
            return objetosFiltrados;
        } catch (error) {
            console.error('Error al obtener los objetos:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
    async getAccesorios() {
        try {
            // Realiza la llamada a la API para obtener todos los objetos
            const response = await axios.get(`${this.baseUrl}InvVehiculo`);
            const objetosFiltrados = response.data.filter(objeto => {
                const invCodigoInt = parseInt(objeto.invCodigo, 10);
                return invCodigoInt >= 24 && invCodigoInt <= 27;
            });
            return objetosFiltrados;
        } catch (error) {
            console.error('Error al obtener los objetos:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
    
}
