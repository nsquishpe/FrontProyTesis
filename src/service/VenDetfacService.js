import axios from 'axios';
export default class VenDetfacService {

    baseUrl = 'http://localhost/BackProyTesis/api/';
    
    async getDetalles(anio, encfacNumero) {
        try {

            // Realiza la llamada a la API para obtener el cliente por su año y código
            const response = await axios.get(`${this.baseUrl}VenDetfac/${anio}/${encfacNumero}`);
            const data = response.data; // Suponiendo que la respuesta contiene un array de objetos
            const modifiedData = data.map(item => {
                // Verificar si la propiedad detfacTipodet es '*'
                if (item.detfacTipodet === '*') {
                    item.detfacTipodet = 'NA'; // Modificar '*'' por 'N/A'
                }
                return item; // Es crucial retornar el objeto modificado
            });
        
            // Retornar los objetos modificados para que puedan ser utilizados en otra parte del código
            return modifiedData;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }
}
