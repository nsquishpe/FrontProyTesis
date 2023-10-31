import axios from 'axios';
export default class OrdTrabCabService {

    baseUrl = 'http://localhost/BackProyTesis/api/';


    async getOrdenes(year) {
        try {
            // Realiza las llamadas a la API para obtener órdenes de trabajo y marcas en paralelo
            const [ordenesResponse, marcasResponse] = await Promise.all([
                axios.get(`${this.baseUrl}CabOrdenTrabajo`, { params: { anio: year } }),
                axios.get(`${this.baseUrl}VenVehmarmod`)
            ]);
    
            // Obtiene los datos de órdenes de trabajo y marcas
            const ordenes = ordenesResponse.data;
            const marcas = marcasResponse.data;
    
            // Mapea los códigos de marca a los nombres de las marcas en los objetos de órdenes de trabajo
            const ordenesConNombresDeMarcas = ordenes.map(orden => {
                const marca = marcas.find(marca => marca.vehmarmodCodigo === orden.vehmarmodCodigo);
                orden.vehmarmodNombre = marca ? marca.vehmarmodNombre : null;
                return orden;
            });
    
            // Devuelve los datos de órdenes de trabajo con nombres de marcas añadidos
            return ordenesConNombresDeMarcas;
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
    
    async AsignarNumOrd(anio) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}CabOrdenTrabajo/num/${anio}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
    
    async createCabOrden(ord) {
        try {
            console.log(ord);
            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.post(`${this.baseUrl}CabOrdenTrabajo`, ord);

            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            throw new Error('Error al crear el cliente.'); 
        }
    }

    async updateCabOrden(ord) {
        try {
            console.log(ord);
            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.put(`${this.baseUrl}CabOrdenTrabajo`, ord);

            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            throw new Error('Error al crear el cliente.'); 
        }
    }
    
    async deleteCabOrden(ord) {
        try {
            // Realiza la llamada a la API para crear un nuevo cliente
            const response = await axios.delete(`${this.baseUrl}CabOrdenTrabajo`, { data: ord });

            // Devuelve la respuesta de la API en caso de éxito
            return response.data;
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            throw new Error('Error al crear el cliente.'); 
        }
    }    
    async getCabById(anio, codigo) {
        try {
            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}CabOrdenTrabajo/num/${anio}/${codigo}`);
            console.warn(response);
            // Devuelve el cliente obtenido de la API
            return response.data;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return null; // Devuelve null si no se encuentra el cliente o en caso de error
        }
    }
    
}
