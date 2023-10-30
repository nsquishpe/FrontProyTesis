import axios from 'axios';
export default class InvVehiculoService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async getInterior() {
        try {
            // Realiza la llamada a la API para obtener todos los objetos
            const response = await axios.get(`${this.baseUrl}InvVehiculo`);
            const objetosFiltrados = response.data.filter(objeto => {
                const invCodigoInt = parseInt(objeto.invCodigo, 10);
                return invCodigoInt >= 1 && invCodigoInt <= 22;
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
                return invCodigoInt >= 23 && invCodigoInt <= 32;
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
                return invCodigoInt == 33;
            });
            return objetosFiltrados;
        } catch (error) {
            console.error('Error al obtener los objetos:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
    async dividirInventario(inventario) {
        try {
            const interiores = inventario.filter(objeto => {
                const invCodigoInt = parseInt(objeto.invCodigo, 10);
                return invCodigoInt >= 1 && invCodigoInt <= 22;
            });
    
            const exteriores = inventario.filter(objeto => {
                const invCodigoInt = parseInt(objeto.invCodigo, 10);
                return invCodigoInt >= 23 && invCodigoInt <= 32;
            });
    
            const accesorios = inventario.filter(objeto => {
                const invCodigoInt = parseInt(objeto.invCodigo, 10);
                return invCodigoInt == 33;
            });
    
            return {
                interiores,
                exteriores,
                accesorios
            };
        } catch (error) {
            console.error('Error al dividir el inventario:', error);
            return {
                interiores: [],
                exteriores: [],
                accesorios: []
            };
        }
    }
    
}
