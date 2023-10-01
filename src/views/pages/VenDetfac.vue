<template>
  <div id="invoice">
    <div id="invoice-top">
      <div class="info">
        <Button icon="pi pi-arrow-left" @click="regresar" class="p-button-rounded p-button bg-blue-900 text-white mr-2"></Button>
      </div>
      <div class="title">
        <div class="flex items-center mb-3">
          <label class="text-gray-900 text-2xl font-medium mb-0 mr-4">Factura</label>
          <div class="text-gray-900 text-2xl font-medium mb-0">{{ referenciaDeModelo }}</div>
        </div>
        <div class="label">Fecha: {{ propietario }}</div>
        <div class="label">Usuario: {{ propietario }}</div>
      </div>
    </div>
    <div id="invoice-mid">
      <div class="info">
        <div class="flex items-center mb-3">
          <div class="bg-cyan-100 rounded-full p-2 mr-2">
            <i class="pi pi-user text-cyan-400 text-2xl"></i>
          </div>
          <label class="text-black-900 text-2xl font-medium mb-0">Propietario del Vehículo</label>
        </div>
        <div class="label  mb-2" style="font-weight: bold;">Nombre: {{ propietario }}</div>
        <div class="label" style="font-weight: bold;">Código: {{ propietario }}</div>
      </div>

      <div id="project" class="mb-6">
        <div class="flex items-center mb-3">
          <div class="bg-cyan-100 rounded-full p-2 mr-2">
            <i class="pi pi-car text-cyan-500 text-2xl"></i>
          </div>
          <label class="text-black text-2xl font-medium mb-0">Información del Vehículo</label>
        </div>
        <div class="flex justify-between mb-2">
          <div class="label mr-4" style="font-weight: bold;">Placa: {{ placa }}</div>
          <div class="label" style="font-weight: bold;">Marca: {{ marca }}</div>
        </div>
        <div class="flex justify-between">
          <div class="label mr-4" style="font-weight: bold;">Color: {{ color }}</div>
          <div class="label" style="font-weight: bold;">Kilometraje: {{ kilometraje }}</div>
        </div>
      </div>
    </div>
    <div id="table">
      <DataTable
            :value="servicios"
            :paginator="false"
            responsiveLayout="scroll"
          >
            <!-- Definición de las columnas del DataTable -->
            <Column field="codigo" header="Código" :sortable="false" style="background-color: #e9ecf0; color: #212529;" />
            <Column field="descripcion" header="Descripción" :sortable="false" style="background-color: #e9ecf0; color: #212529;"/>
            <Column field="cantidad" header="Cantidad" :sortable="false" style="background-color: #e9ecf0; color: #212529;" />
            <Column field="precio" header="Precio" :sortable="false" style="background-color: #e9ecf0; color: #212529;"/>
            <Column field="descuento" header="Descuento" :sortable="false" style="background-color: #e9ecf0; color: #212529;"/>
            <Column field="total" header="Total" :sortable="false" style="background-color: #e9ecf0; color: #212529;"/>
      </DataTable>
    </div>
    <!-- Fila adicional después del DataTable -->
    <table class="tabletitle" style="text-align: right;">
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><div class="label" >Total Neto: {{ kilometraje }}</div></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><div class="label">Valor IVA: {{ kilometraje }}</div></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><div class="label">TOTAL: {{ kilometraje }}</div></td>
            <td></td>
        </tr>
   </table>
  </div>
</template>

<script>
export default {
  name: 'InvoiceComponent',
  // Puedes agregar aquí las propiedades, métodos y demás que necesites para tu componente Vue
}
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Roboto:100,300,400,900,700,500,300,100);
*{
  margin: 0;
  box-sizing: border-box;

}
h1{
  font-size: 1.5em;
  color: #222;
}
h2{font-size: .9em;}
h3{
  font-size: 1.2em;
  font-weight: 300;
  line-height: 2em;
}
p{
  font-size: .7em;
  color: #666;
  line-height: 1.2em;
}

#invoiceholder{
  width:100%;
  height: 100%;
  padding-top: 50px;
}
#headerimage{
  z-index: -1;
  position: relative;
  height: 100vh;
  -webkit-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,.15);
  -moz-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,.15);
  box-shadow: inset 0 2px 4px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,.15);
  overflow:hidden;
}

#invoice{
  position: relative;
  margin: 0 auto;
  width: 90%;
  background: #FFF;
}

[id*='invoice-']{ /* Targets all id with 'col-' */
  border-bottom: 1px solid #EEE;
  padding: 30px;
}

#invoice-top{min-height: 120px;}
#invoice-mid{min-height: 120px;}
#invoice-bot{ min-height: 250px;}

.logo{
  float: left;
  height: 60px;
  width: 60px;
  background: url(http://michaeltruong.ca/images/logo1.png) no-repeat;
  background-size: 60px 60px;
}
.clientlogo{
  float: left;
  height: 60px;
  width: 60px;
  background: url(http://michaeltruong.ca/images/client.jpg) no-repeat;
  background-size: 60px 60px;
  border-radius: 50px;
}
.info{
  display: block;
  float:left;
  margin-left: 20px;
}
.title{
  float: right;
}
.title p{text-align: right;}
#project{margin-left: 52%;}
table{
  width: 100%;
  border-collapse: collapse;
}
td{
  padding: 5px 0 5px 15px;
  border: 1px solid #EEE
}
.tabletitle{
  padding: 5px;
  background: #EEE;
}
.service{border: 1px solid #EEE;}
.item{width: 50%;}
.itemtext{font-size: .9em;}
</style>
