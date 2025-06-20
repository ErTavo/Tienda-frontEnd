<template>
  <div class="kanban-board">
    <h1 class="title">PEDIDOS</h1>
    <div class="add-order">
      <button @click="showForm = true" aria-label="Abrir formulario">Agregar Pedido</button>
    </div>

    <div v-if="showForm" class="form-overlay">
      <div class="form-popup">
        <h3>Nuevo Pedido</h3>
        <label>
          Menú:
          <select v-model="form.menu">
            <option disabled value="">Seleccione una opción</option>
            <option v-for="item in menuOptions" :key="item.Menu" :value="item.Menu">
              {{ item.Menu }}
            </option>
          </select>
        </label>

        <label>
          Nombre:
          <input type="text" v-model="form.name" placeholder="Nombre" />
        </label>

        <label>
          Hora de entrega:
          <select v-model="form.horaEntrega">
            <option disabled value="">Seleccione una hora</option>
            <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
              {{ hora }}
            </option>
          </select>
        </label>

        <div class="form-buttons">
          <button @click="submitForm">Agregar</button>
          <button @click="cancelForm">Cancelar</button>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column" v-for="(column, colIndex) in columns" :key="colIndex">
        <h2>{{ column.name }}</h2>
        <div class="order-list">
          <div class="order-card" v-for="(order, index) in column.orders" :key="order.id">
            <template v-if="isEditing(order.id)">
              <input v-model="editTitle" @keyup.enter="saveEdit(order)" @keyup.esc="cancelEdit"
                @blur="saveEdit(order)" class="edit-input" ref="editInput" aria-label="Editar pedido" />
            </template>
            <template v-else>
              <span @dblclick="startEdit(order)" tabindex="0" @keydown.enter="startEdit(order)">
                {{ order.title }}
              </span>
              <div class="order-actions">
                <button v-if="column.name === 'Pendientes'" 
                        @click="markAsDelivered(order, colIndex, index)"
                        class="check-btn"
                        aria-label="Marcar como entregado">
                  ✓
                </button>
                <button class="delete-btn" @click="deleteOrder(colIndex, index)" aria-label="Eliminar pedido">
                  ×
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  created() {
    this.verifyAuth();
  },
  data() {
    return {
      showForm: false,
      form: {
        menu: '',
        name: '',
        horaEntrega: ''
      },
      horasDisponibles: [],
      menuOptions: [],
      editingId: null,
      editTitle: '',
      columns: [
        {
          name: "Pendientes",
          orders: [],
        },
        {
          name: "Entregados",
          orders: [],
        },
      ],
    };
  },

  methods: {
    verifyAuth() {
      const authToken = sessionStorage.getItem('authToken');
      if (!authToken) {
        this.$router.push('/');
      }
    },

    async loadOrdersFromApi() {
      try {
        const response = await fetch("https://tienda-mu-nine.vercel.app/api/orders");
        if (!response.ok) throw new Error("Error al cargar datos");

        const json = await response.json();
        const data = json.data;

        this.columns[0].orders = data
          .filter(order => order.estado === "pendiente")
          .map(order => ({
            id: order.orderId,
            title: `${order.menu} - ${order.cliente} - ${order.horaEntrega}`,
            estado: order.estado
          }));

        this.columns[1].orders = data
          .filter(order => order.estado === "entregado")
          .map(order => ({
            id: order.orderId,
            title: `${order.menu} - ${order.cliente} - ${order.horaEntrega}`,
            estado: order.estado
          }));
      } catch (error) {
        console.error("Error cargando pedidos:", error);
        Swal.fire({
          icon: "info",
          title: "Sin pedidos",
          text: "No hay pedidos por el momento.",
        });
      }
    },

    async loadMenu() {
      try {
        const response = await fetch("https://tienda-mu-nine.vercel.app/api/menu");
        const json = await response.json();
        this.menuOptions = json.data;
      } catch (error) {
        console.error("Error cargando menú:", error);
      }
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

      this.horasDisponibles = horas;
    },

    async submitForm() {
      if (!this.form.menu || !this.form.name || !this.form.horaEntrega) return;

      

      const payload = {
        menu: this.form.menu,
        descripcion: `Pedido de menú ${this.form.menu}`,
        precio: "20",
        cliente: this.form.name,
        telefono: "00000000",
        horaEntrega: this.form.horaEntrega
      };

      try {
        const response = await fetch("https://tienda-mu-nine.vercel.app/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
          const newOrder = {
            id: result.orderId,
            title: `${payload.menu} - ${payload.cliente} - ${payload.horaEntrega}`,
            estado: 'pendiente'
          };
          this.columns[0].orders.push(newOrder);
          this.showForm = false;
          this.form = { menu: '', name: '', horaEntrega: '' };

          Swal.fire({
            icon: 'success',
            title: '¡Pedido agregado!',
            text: 'El pedido fue registrado correctamente.',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error(result.message || 'Error al agregar pedido');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
      }
    },

    cancelForm() {
      this.showForm = false;
      this.form = { menu: '', name: '', horaEntrega: '' };
    },

    async markAsDelivered(order, colIndex, orderIndex) {
      try {
        const confirmed = await Swal.fire({
          title: '¿Marcar como entregado?',
          text: `¿Confirmas que el pedido "${order.title}" ha sido entregado?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, entregado',
          cancelButtonText: 'Cancelar',
        });

        if (!confirmed.isConfirmed) return;

        const response = await fetch("https://tienda-mu-nine.vercel.app/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            orderId: order.id, 
            estado: 'entregado' 
          })
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const deliveredOrder = {
          ...order,
          estado: 'entregado'
        };

        this.columns[0].orders.splice(orderIndex, 1);
        this.columns[1].orders.push(deliveredOrder);

        Swal.fire({
          icon: 'success',
          title: '¡Entregado!',
          text: 'El pedido se marcó como entregado',
          timer: 1500,
          showConfirmButton: false
        });

      } catch (error) {
        console.error("Error al marcar como entregado:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo actualizar el estado',
        });
      }
    },

    async deleteOrder(colIndex, orderIndex) {
      try {
        const order = this.columns[colIndex].orders[orderIndex];

        const confirmed = await Swal.fire({
          title: '¿Estás seguro de eliminar el pedido?',
          text: `Pedido: ${order.title}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        });

        if (!confirmed.isConfirmed) return;

        const response = await fetch("https://tienda-mu-nine.vercel.app/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            orderId: order.id, 
            estado: 'eliminado' 
          })
        });

        if (!response.ok) throw new Error('Error al actualizar el estado');

        this.columns[colIndex].orders.splice(orderIndex, 1);

        if (this.editingId === order.id) this.cancelEdit();

        Swal.fire({
          icon: 'success',
          title: 'Pedido eliminado',
          text: 'El pedido se ha marcado como eliminado',
          timer: 1500,
          showConfirmButton: false
        });

      } catch (error) {
        console.error("Error al eliminar pedido:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el pedido',
        });
      }
    },

    startEdit(order) {
      this.editingId = order.id;
      this.editTitle = order.title;
      this.$nextTick(() => {
        if (this.$refs.editInput && this.$refs.editInput[0]) {
          this.$refs.editInput[0].focus();
        }
      });
    },

    isEditing(id) {
      return this.editingId === id;
    },

    saveEdit(order) {
      if (!this.editTitle.trim()) {
        this.cancelEdit();
        return;
      }
      order.title = this.editTitle.trim();
      this.cancelEdit();
    },

    cancelEdit() {
      this.editingId = null;
      this.editTitle = '';
    }
  },

  mounted() {
    this.loadOrdersFromApi();
    this.loadMenu();
    this.generarHoras();
  }
};
</script>



<style scoped>


.kanban-board {
  min-height: 100vh;
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 10px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  color: #222;
  background-color: transparent;
}

.title {
  text-align: center;
  font-size: 3rem;
  font-weight: 900;
  color: #3b5998;
  text-shadow: 2px 2px 5px rgba(59, 89, 152, 0.7);
  margin-bottom: 20px;
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

.column:nth-child(1) {
  background-color: #fdfdfd;
}

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
</style>
