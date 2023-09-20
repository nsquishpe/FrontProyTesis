<template>
    <div class="invoice-container">
      <div class="invoice-header">
        <h1>Detalle de la Factura</h1>
        <div class="invoice-info">
          <p>Número de Factura: 12345</p>
          <p>Fecha de Emisión: 19/09/2023</p>
        </div>
      </div>
      
      <div class="invoice-details">
        <!-- Sección de Información del Cliente -->
        <div class="invoice-customer">
          <h2>Información del Cliente</h2>
          <p>Nombre del Cliente: Nombre del Cliente</p>
          <p>Código del Cliente: C123</p>
        </div>
        
        <!-- Sección de Información del Vehículo -->
        <div class="invoice-vehicle">
          <h2>Información del Vehículo</h2>
          <p>Placa del Vehículo: ABC-123</p>
        </div>
      </div>
  
      <div class="invoice-table">
        <h2>Detalles de la Factura</h2>
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Producto 1</td>
              <td>2</td>
              <td>10</td>
              <td>20</td>
            </tr>
            <tr>
              <td>Producto 2</td>
              <td>3</td>
              <td>15</td>
              <td>45</td>
            </tr>
            <tr>
              <td>Producto 3</td>
              <td>1</td>
              <td>20</td>
              <td>20</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="invoice-total">
        <p>Total: 85</p>
      </div>
    </div>
  </template>
  
  <style scoped>
  .invoice-container {
    background-color: #f4f4f4;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    margin: 20px;
  }
  
  .invoice-header {
    text-align: center;
  }
  
  .invoice-info, .invoice-table, .invoice-total {
    margin: 20px 0;
  }
  
  .invoice-details {
    display: flex;
    justify-content: space-between; /* Coloca las secciones una al lado de la otra */
  }
  
  .invoice-customer, .invoice-vehicle {
    flex: 1; /* Distribuye el espacio de manera uniforme entre las secciones */
    margin-right: 20px; /* Espacio entre las secciones */
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  th, td {
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  .invoice-total {
    font-weight: bold;
    text-align: right;
  }
  </style>
  