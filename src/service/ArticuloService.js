import axios from 'axios';
export default class ArticuloService {

    baseUrl = 'http://localhost/BackProyTesis/api/';

    async modeloArticulo(anio, grup, nombre) {
        try {
            const venMaeArticuloResponse = await axios.get(`${this.baseUrl}InvMaearticulo/${anio}/${grup}`);
            const venMaeArticuloData = venMaeArticuloResponse.data;
            if (venMaeArticuloData.length === 0) {
                return [];
            }

            const promises = venMaeArticuloData.map(async (venMaeArticulo) => {
                try {

                    venMaeArticulo.grupNombre = nombre;

                    // Obtener el precio de la API InvTrnkardex (sustituye 2018 y 217 con valores reales)
                    const precioResponse = await axios.get(`${this.baseUrl}InvTrnkardex/ven/${anio}/${venMaeArticulo.artCodigo}`);
                    venMaeArticulo.precio = precioResponse.data;

                    // Obtener el stock de la API InvTrnkardex
                    const invTrnkardexResponse = await axios.get(`${this.baseUrl}InvTrnkardex/stock/${anio}/${venMaeArticulo.artCodigo}`);
                    const stock = invTrnkardexResponse.data;
                    venMaeArticulo.stock = stock;

                    // Calcular el estado basado en el stock
                    if (stock >= 3) {
                        venMaeArticulo.inventoryStatus = 'Disponible';
                    } if (stock <= 2) {
                        venMaeArticulo.inventoryStatus = 'Limitado';
                    } if (stock == 0) {
                        venMaeArticulo.inventoryStatus = 'Agotado';
                    }

                    return venMaeArticulo;
                } catch (error) {
                    console.error('Error al obtener datos:', error);
                    throw error;
                }
            });

            // Esperar a que todas las promesas se resuelvan
            const combinedData = await Promise.all(promises);

            return combinedData;
        } catch (error) {
            console.error('Error al combinar los datos:', error);
            throw error;
        }
    }
    
}
