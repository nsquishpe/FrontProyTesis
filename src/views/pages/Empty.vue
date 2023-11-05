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

  // Fecha y hora de emisión (alineado a la derecha del logo)
  const currentDateTime = new Date().toLocaleString();
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(currentDateTime, doc.internal.pageSize.getWidth() - 20, 20, 'right');

  // Título del reporte (centrado)
  doc.setFontSize(16);
  doc.setTextColor(26, 42, 99);
  doc.text('FACTURAS EMITIDAS', doc.internal.pageSize.getWidth() / 2, 35, 'center');

  // Fechas (centradas)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const fromDate = '30/08/2343';
  const toDate = '30/08/2343';
  const dateText = `Desde: ${fromDate}  Hasta: ${toDate}`;
  const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
  const startX = (doc.internal.pageSize.getWidth() - dateTextWidth) / 2;
  doc.text(dateText, startX, 45);

   // Calcular el total
  const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  // Encabezado de la tabla
  const tableHeaders = [['Descripción', 'Cantidad', 'Precio unitario', 'Total']];

  // Contenido de la tabla
  const tableData = items.map(item => [item.description, item.quantity, item.price, item.quantity * item.price]);

  // Generar la tabla
  doc.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: 55,
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
    margin: { top: 60 }, // Ajustar el margen superior para evitar que la tabla se corte
  });

  // Mostrar la suma de la columna "Total" debajo de la tabla

  doc.setFontSize(12);
  doc.text(`Total: ${total}`, 80, doc.lastAutoTable.finalY + 10);

  // Guardar el PDF con un nombre específico (puedes personalizar el nombre del archivo)
  const formattedDate = '30/08/2023';
  const fileName = `Report-${formattedDate}-B001.pdf`;
  doc.save(fileName);
};
</script>


<style scoped>
</style>
