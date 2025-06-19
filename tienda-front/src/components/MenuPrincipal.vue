<template>

  <div class="container py-5">

    <div class="row justify-content-center">
      <h1 class="text-center">Menu del día</h1>

      <div class="col-md-6" v-for="item in menuOptions" :key="item.menu">

        <div class="card mb-4 shadow-sm">

          <div class="row g-0">

            <div class="col-md-8">

              <div class="card-body">

                <h5 class="card-title">{{ item.Menu }}</h5>

                <p class="card-text">{{ item.Descripcion }}</p>

                <p class="card-text"><small class="text-muted">Precio: Q.{{ item.precio }}.00</small></p>

                <button class="btn btn-primary btn-sm" @click="selectOrder(item)">Pedir</button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>



    <!-- Formulario emergente -->

    <div v-if="showForm" class="form-overlay d-flex justify-content-center align-items-center">

      <div class="form-popup bg-white p-4 rounded shadow" style="width: 100%; max-width: 400px;">

        <h4 class="mb-3 text-center">Nuevo Pedido</h4>

        <p><strong>Menú seleccionado:</strong> {{ selectedOrder.Descripcion }}</p>

        <p><strong>Precio:</strong> Q.{{ selectedOrder.precio }}.00</p>



        <div class="mb-3">

          <label class="form-label">Nombre:</label>

          <input type="text" class="form-control" v-model="form.name" placeholder="Nombre" />

        </div>



        <div class="mb-3">

          <label class="form-label">Teléfono:</label>

          <input type="text" class="form-control" v-model="form.phone" placeholder="Teléfono" />

        </div>

        <div class="mb-3">

          <label class="form-label">Horario de entrega</label>

          <select class="form-control" v-model="form.hora" placeholder="Hora">

           <option v-for="item in horaPedido" :key="item" :value="item ">
              {{ item }}
            </option>
          </select>

        </div>



        <div class="d-flex justify-content-between">

          <button class="btn btn-success" @click="changeNotification">Confirmar</button>

          <button class="btn btn-danger" @click="cancelForm">Cancelar</button>

        </div>

      </div>

    </div>


  <!-- Formulario emergente confirmación-->


<div v-if="showFormNotification" class="form-overlay d-flex justify-content-center align-items-center">

  <div class="form-popup bg-white p-4 rounded shadow" style="width: 100%; max-width: 400px;">

    <h4 class="mb-3 text-center">Confirmar pedido</h4>
    <p>¿Deseas confirmar tu pedido?</p>
    <p><strong>Menú:</strong> {{ selectedOrder.Menu }}</p>
    <p><strong>Descripción:</strong> {{ selectedOrder.Descripcion }}</p>
    <p><strong>Precio:</strong> Q.{{ selectedOrder.precio }}.00</p>
    <p><strong>Nombre: </strong> {{ form.name }}</p>
    <p><strong>Teléfono: </strong> {{ form.phone }}</p>
     <p><strong>Horario de entrega: </strong> {{ form.hora }}</p>

    <div class="d-flex justify-content-between gap-3">

      <button class="btn btn-success" @click="submitForm">Confirmar</button>

      <button class="btn btn-success" @click="notificationForm">Notificar</button>
      
      <button class="btn btn-danger" @click="cancelForm">Cancelar</button>

    </div>

  </div>

</div>



  </div>

</template>


<script>

import Swal from "sweetalert2";

export default {

  
 data() {
  return {
      showForm: false,
      showFormNotification: false,
      selectedOrder: '',
      form: {
        /*menu: '',*/
        name: '',
        phone: '',
        hora:  '',
      },
      menuOptions: [],
      horaPedido: [],
    };
  },
methods: {
  selectOrder(order) {  
    this.showForm = true;
    this.selectedOrder = order;
    console.log(this.selectedOrder);

  },
   async submitForm() {
      if (!this.form.phone || !this.form.name) return;

      const payload = {
        menu: this.selectedOrder.Menu,
        descripcion: this.selectedOrder.Descripcion,
        precio: this.selectedOrder.precio,
        cliente: this.form.name,
        telefono: this.form.phone,
        horaEntrega : this.form.hora
      };

      try {
        const response = await fetch("https://tienda-mu-nine.vercel.app/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: '¡Pedido agregado!',
            text: 'El pedido fue registrado correctamente.',
            timer: 1500,
            showConfirmButton: false
          });
          this.showFormNotification = false;

            this.form = { name: '', phone: '', hora: ''};
            this.selectedOrder = null;
        } else {
          throw new Error(result.message || 'Error al agregar pedido');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
      } 
    },
async notificationForm() {
    this.submitForm();
    const numero = 58166694;
    const mensaje = `Hola, soy *${this.form.name}*, realicé un pedido de ${this.selectedOrder.Menu}, estaría recogiendolo a las ${this.form.hora}`;
    const url = `https://wa.me/502${numero}?text=${mensaje}`; // estructura correcta del link
    console.log(url);
    window.open(url, '_blank'); // abre en nueva pestaña
},
    cancelForm() {
      this.showForm = false;
      this.form = { menu: '', name: '' };
      this.showFormNotification = false;
      this.form = { name: '', phone: '' };
      this.selectedOrder = null;
    },


    generarHoras() {
      const horas = [];
      const inicio = 8 * 60;
      const fin = 18 * 60;

      for (let min = inicio; min <= fin; min += 30) {
        const hora = Math.floor(min / 60);
        const minuto = min % 60;
        const hora12 = hora % 12 === 0 ? 12 : hora % 12;
        const ampm = hora < 12 ? 'AM' : 'PM';
        horas.push(`${hora12}:${minuto.toString().padStart(2, '0')} ${ampm}`);
      }

      this.horaPedido   = horas;
    },
 async changeNotification() {


      this.showForm = false;
      this.showFormNotification = true;

    },
async loadMenu() {
      try {
        const response = await fetch("https://tienda-mu-nine.vercel.app/api/menu");
        const json = await response.json();
        const filterJson = json.data.filter((data) => {return data.activo === 'TRUE'});
        console.log(filterJson); 
        this.menuOptions = filterJson;
        console.log('El componente se ha montado', this.menuOptions);
      } catch (error) {
        console.error("Error cargando menú:", error);
      }
    },
  },

  mounted() {
  this.loadMenu();
  this.generarHoras();
}
}
</script>

<style scoped>

button {
  width: 100%;
  background-color: #5c6ac4;
  color: white;
  border: none;
  padding: 12px;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #4b57a1;
}



.add-order {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.add-order button {
  background-color: #5c6ac4;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-order button:hover,
.form-buttons button:hover {
  background-color: #4b57a1;
}

.add-order button:focus,
input:focus,
select:focus,
.form-buttons button:focus,
.delete-btn:focus {
  outline: 2px solid #5c6ac4;
  outline-offset: 2px;
}

.columns {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.column {
  flex: 1 1 350px;
  background: #fafafa;
  padding: 15px 12px;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgb(0 0 0 / 0.1);
  min-width: 320px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
}

/* Columna 1 (Pendientes) */
.column:nth-child(1) {
  background-color: #fdfdfd;
}

/* Columna 2 (Entregados) */
.column:nth-child(2) {
  background-color: #fdfdfd;
}

.order-list {
  background: rgb(255, 255, 255);
  border-radius: 8px;
  min-height: 120px;
  padding: 10px;
  box-shadow: inset 0 0 5px rgb(0 0 0 / 0.05);
  overflow-y: auto;
  max-height: 400px;

  scrollbar-width: thin;
  scrollbar-color: #5c6ac4 #f0f0f0;
}

.order-list::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.order-list::-webkit-scrollbar-thumb {
  background: #5c6ac4;
  border-radius: 4px;
}

.order-card {
  background: #e4e7f0;
  padding: 12px 14px;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #333;
  user-select: none;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.order-card:active {
  cursor: grabbing;
  background-color: #d0d4e6;
  transform: scale(0.98);
}

.delete-btn {
  background: transparent;
  border: none;
  color: #b33a3a;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0 6px;
  user-select: none;
  transition: color 0.2s ease;
}

.delete-btn:hover {
  color: #7a1d1d;
}

.delete-btn:focus {
  outline: 2px solid #5c6ac4;
  outline-offset: 2px;
}

.edit-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid #5c6ac4;
  border-radius: 6px;
  outline-offset: 2px;
  transition: border-color 0.3s ease;
}

/* Formulario */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-popup {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-popup label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
}

.form-popup input,
.form-popup select {
  width: 100%;
  padding: 8px 10px;
  margin-top: 4px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
}

.form-buttons button {
  background-color: #5c6ac4;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

@media (max-width: 600px) {
  .columns {
    flex-direction: column;
    gap: 20px;
  }

  .column {
    max-width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .add-order {
    flex-direction: column;
  }

  .add-order button {
    width: 100%;
  }
  .order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  background: #f5f5f5;
  border-radius: 4px;
}

.check-button {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: 8px;
}

.check-button:hover {
  background: #45a049;
}
}
.order-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 8px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-actions {
  display: flex;
  gap: 8px;
}

.check-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.3s;
}

.check-btn:hover {
  background: #45a049;
}

.delete-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #d32f2f;
}
.delete-btn {
  transition: all 0.3s;
}

.delete-btn.processing {
  opacity: 0.7;
  background: #ff9800;
}

.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}
h1{
  align-items: center;
  justify-content: center;
}
</style>

