<template>
  <div class="invoice">
    <button @click="generatePDF">Generar PDF</button>
  </div>
</template>

<script setup>
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

const items = [
  { description: 'Producto 1', quantity: 2, price: 10 },
  { description: 'Producto 1', quantity: 3, price: 10 },
  { description: 'Producto 1', quantity: 3, price: 10 },
  { description: 'Producto 2', quantity: 1, price: 15 },
  { description: 'Producto 3', quantity: 3, price: 8 },
];

const generatePDF = () => {
  const doc = new jsPDF();

   // Logo de la empresa (ajustar tamaño)
   const logo = '/demo/images/login/Logo.png'; // Ruta al logo
   const logoWidth = 50; // Ancho del logo ajustado
   const logoHeight = (logoWidth * 20) / 70; // Proporción del logo
   doc.addImage(logo, 'PNG', 20, 10, logoWidth, logoHeight);

  // Título del reporte
  doc.setFontSize(16);
  doc.setTextColor(26, 42, 99); // Color del encabezado
  doc.text('EXISTENCIA - PRECIOS', doc.internal.pageSize.getWidth() / 2, 35, 'center');
  
  // Fecha de corte
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Color del texto normal
  doc.text('Fecha de Corte: 20/10/2023', doc.internal.pageSize.getWidth() / 2, 40, 'center');

  
   // Agrupar los elementos por descripción
   const groupedItems = {};
  items.forEach(item => {
    if (!groupedItems[item.description]) {
      groupedItems[item.description] = [];
    }
    groupedItems[item.description].push(item);
  });

  // Posición inicial de la tabla
  let startY = 45;

  // Generar tablas separadas por descripción
  Object.keys(groupedItems).forEach(description => {
    // Encabezado de la tabla
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(description, doc.internal.pageSize.getWidth() / 2, startY + 10, 'center');

    // Contenido de la tabla
    doc.autoTable({
      head: [['Descripción', 'Cantidad', 'Precio unitario', 'Total']],
      body: groupedItems[description].map(item => [item.description, item.quantity, item.price, item.quantity * item.price]),
      startY: startY + 20, // Ajusta el espacio superior según tus necesidades
      styles: {
        cellPadding: 2,
        fontSize: 10,
        valign: 'middle',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left' },
      },
      headStyles: {
        fillColor: [190, 223, 251], 
        textColor: [0, 0, 0], 
      },
    });
    // Actualizar la posición inicial para la siguiente tabla
    startY = doc.autoTable.previous.finalY + 10;
  });

  // Guardar el PDF con un nombre específico (puedes personalizar el nombre del archivo)
  const formattedDate = '30/08/2023';
  const fileName = `Report-${formattedDate}-B001.pdf`;
  doc.save(fileName);
};
</script>


<style scoped>
</style>
