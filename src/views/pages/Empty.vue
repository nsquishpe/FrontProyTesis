<template>
  <div class="invoice">
    <button @click="generatePDF">Generar PDF</button>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

export default {
  data() {
    return {
      items: [
        { description: 'Producto 1', quantity: 2, price: 10 },
        { description: 'Producto 2', quantity: 1, price: 15 },
        { description: 'Producto 3', quantity: 3, price: 8 },
      ],
    };
  },
  methods: {
    generatePDF() {
    const doc = new jsPDF();

    // Encabezado de la factura
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243); // Color del encabezado
    doc.text('Factura', doc.internal.pageSize.getWidth() / 2, 15, 'center');
    
    // Logo de la empresa (ajusta el tamaño según tus necesidades)
    const logo = '/demo/images/login/Logo.png'; // Ruta al logo
    doc.addImage(logo, 'PNG', 20, 10, 70, 20);

    // Detalles del cliente y factura (reemplaza con tus datos)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Color del texto normal
    doc.text('Cliente: Nombre del Cliente', 20, 40);
    doc.text('Fecha: 20/10/2023', 20, 50);
    
    // Contenido de la tabla
    doc.autoTable({
        head: [['Descripción', 'Cantidad', 'Precio unitario', 'Total']],
        body: this.items.map(item => [item.description, item.quantity, item.price, item.quantity * item.price]),
        startY: 70, // Ajusta el espacio superior según tus necesidades
        styles: {
            cellPadding: 2,
            fontSize: 10,
            valign: 'middle',
            halign: 'center',
        },
        columnStyles: {
            0: { halign: 'left' },
        },
    });

    // Total de la factura
    doc.setFontSize(12);
    doc.text(`Total: ${this.total}`, 14, doc.autoTable.previous.finalY + 10);

    // Guardar el PDF con un nombre específico (puedes personalizar el nombre del archivo)
    doc.save('factura.pdf');
}

}
};
</script>

<style scoped>
/* Estilos personalizados para tu componente PrimeVue */
.invoice {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

.footer {
  text-align: right;
  font-weight: bold;
  font-size: 16px;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
