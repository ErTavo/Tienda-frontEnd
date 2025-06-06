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
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </label>
        <label>
          Nombre:
          <input type="text" v-model="form.name" placeholder="Nombre" />
        </label>
        <label>
          Teléfono:
          <input type="tel" v-model="form.phone" placeholder="Teléfono" />
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
        <Draggable
          v-model="column.orders"
          :group="{ name: 'orders', pull: true, put: true }"
          class="order-list"
          @end="onDragEnd($event, colIndex, column.name)"
          itemKey="id"
        >
          <template #item="{ element, index }">
            <div class="order-card" :key="element.id">
              <template v-if="isEditing(element.id)">
                <input
                  v-model="editTitle"
                  @keyup.enter="saveEdit(element)"
                  @keyup.esc="cancelEdit"
                  @blur="saveEdit(element)"
                  class="edit-input"
                  ref="editInput"
                  aria-label="Editar pedido"
                />
              </template>
              <template v-else>
                <span @dblclick="startEdit(element)" tabindex="0" @keydown.enter="startEdit(element)">
                  {{ element.title }}
                </span>
                <button class="delete-btn" @click="deleteOrder(colIndex, index)" aria-label="Eliminar pedido">
                  ×
                </button>
              </template>
            </div>
          </template>
        </Draggable>
      </div>
    </div>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
import Swal from "sweetalert2";

export default {
  components: { Draggable },
  data() {
    return {
      showForm: false,
      form: {
        menu: '',
        name: '',
        phone: ''
      },
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
      apiUrl: "https://tu-api-aqui.com/orders", // API real :v
    };
  },

  methods: {
    async loadOrdersFromApi() {
      try {
        const response = await fetch(this.apiUrl);
        if (!response.ok) throw new Error('Error al cargar datos');
        const data = await response.json();

        const allOrders = this.columns.flatMap(col => col.orders);
        let maxId = allOrders.length ? Math.max(...allOrders.map(o => o.id)) : 0;

        // pedido recibido al array 
        data.forEach(item => {
          maxId++;
          this.columns[0].orders.push({
            id: maxId,
            title: `Menú ${item.menu} - ${item.name} - ${item.phone} - ${item.date}`
          });
        });
      } catch (error) {
        console.error('Error cargando pedidos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay pedidos pendientes',
        });
      }
    },

    async onDragEnd(evt, toColIndex, fromColName) {
      if (fromColName === 'Entregados' && this.columns[toColIndex].name === 'Pendientes') {
        const confirmed = await Swal.fire({
          title: '¿Seguro que deseas moverlo a Pendiente?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
        });

        if (!confirmed.isConfirmed) {
          const movedItem = this.columns[toColIndex].orders.splice(evt.newIndex, 1)[0];
          this.columns.find(col => col.name === fromColName).orders.splice(evt.oldIndex, 0, movedItem);
        }
      }
    },

    submitForm() {
      if (!this.form.menu || !this.form.name || !this.form.phone) return;
      const allOrders = this.columns.flatMap(col => col.orders);
      const maxId = allOrders.length ? Math.max(...allOrders.map(o => o.id)) : 0;
      const newId = maxId + 1;
      const date = new Date().toLocaleDateString();

      this.columns[0].orders.push({
        id: newId,
        title: `Menú ${this.form.menu} - ${this.form.name} - ${this.form.phone} - ${date}`,
      });

      this.showForm = false;
      this.form = { menu: '', name: '', phone: '' };

      Swal.fire({
        icon: 'success',
        title: '¡Pedido agregado!',
        text: 'El pedido fue registrado correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
    },

    cancelForm() {
      this.showForm = false;
      this.form = { menu: '', name: '', phone: '' };
    },

    async deleteOrder(colIndex, orderIndex) {
      const confirmed = await Swal.fire({
        title: '¿Estás seguro de eliminar el pedido?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
      });

      if (confirmed.isConfirmed) {
        this.columns[colIndex].orders.splice(orderIndex, 1);
        if (this.editingId && !this.columns.some(col => col.orders.find(o => o.id === this.editingId))) {
          this.cancelEdit();
        }
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
    },
  },

  mounted() {
    this.loadOrdersFromApi();
  }
};
</script>

<style scoped>
.kanban-board {
  min-height: 500vh;
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

.add-order button:hover {
  background-color: #4b57a1;
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

.order-list {
  background: rgb(255, 255, 255);
  border-radius: 8px;
  min-height: 120px;
  padding: 10px;
  box-shadow: inset 0 0 5px rgb(0 0 0 / 0.05);
  overflow-y: auto;
  max-height: 400px;
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
  transition: background-color 0.3s ease;
}

.order-card:active {
  cursor: grabbing;
  background-color: #d0d4e6;
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

.form-buttons button:hover {
  background-color: #4b57a1;
}

@media (max-width: 600px) {
  .columns {
    flex-direction: column;
    gap: 20px;
  }
  .column {
    max-width: 100%;
  }
  .add-order {
    flex-direction: column;
  }
  .add-order button {
    width: 100%;
  }
}
</style>
