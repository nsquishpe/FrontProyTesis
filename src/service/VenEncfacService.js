import axios from 'axios';
export default class ClienteService {

    baseUrl = 'http://localhost/BackProyTesis/api/';

    async modeloAuto(year) {
        try {
            // Realiza la llamada a la API para obtener los datos de VenEncfac
            const venEncfacResponse = await axios.get(`${this.baseUrl}VenEncfac`, {
                params: { anio: year }
            });
    
            const venEncfacData = venEncfacResponse.data;
    
            if (venEncfacData.length === 0) {
                return [];
            }
    
            // Crea un array de promesas para las llamadas a VenVhcspcf en paralelo
            const promises = venEncfacData.map((venEncfac) =>
                axios.get(`${this.baseUrl}VenVhcspcf/fac/${year}/${venEncfac.encfacNumero}`)
                    .then((response) => {
                        const venVhcspcfData = response.data;
                        venEncfac.vhcspcfPlaca = venVhcspcfData.vhcspcfPlaca;
                        return venEncfac;
                    })
            );
    
            // Ejecuta todas las promesas en paralelo y espera su resolución con Promise.all
            const combinedData = await Promise.all(promises);
    
            return combinedData;
        } catch (error) {
            console.error('Error al combinar los datos:', error);
            throw error;
        }
    }    
    
    async getVenEncfacById(anio, codigo) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}VenEncfac/num/${anio}/${codigo}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener la venta cabecera:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
}
