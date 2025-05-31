<template>
  <div class="kanban-board">
    <h1>PEDIDOS</h1>
    <div class="add-order">
      <input
        v-model="newOrderTitle"
        placeholder="Nuevo pedido"
        @keyup.enter="addOrder"
        aria-label="Nuevo pedido"
      />
      <button @click="addOrder" aria-label="Agregar pedido">Agregar</button>
    </div>

    <div class="columns">
      <div class="column" v-for="(column, colIndex) in columns" :key="colIndex">
        <h2>{{ column.name }}</h2>
        <Draggable
          v-model="column.orders"
          :group="'orders'"
          class="order-list"
          @end="onDragEnd"
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
                <button
                  class="delete-btn"
                  @click="deleteOrder(colIndex, index)"
                  aria-label="Eliminar pedido"
                >
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

export default {
  components: { Draggable },
  data() {
    return {
      newOrderTitle: '',
      editingId: null,
      editTitle: '',
      columns: [
        {
          name: "Pendientes",
          orders: [
            { id: 1, title: "Pedido #1" },
            { id: 2, title: "Pedido #2" },
          ],
        },
        {
          name: "Pagados",
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
    onDragEnd() {
      console.log("Orden actualizada:", this.columns);
    },
    addOrder() {
      if (!this.newOrderTitle.trim()) return;
      const allOrders = this.columns.flatMap(col => col.orders);
      const maxId = allOrders.length ? Math.max(...allOrders.map(o => o.id)) : 0;
      const newId = maxId + 1;
      this.columns[0].orders.push({
        id: newId,
        title: this.newOrderTitle.trim(),
      });
      this.newOrderTitle = '';
    },
    deleteOrder(colIndex, orderIndex) {
      this.columns[colIndex].orders.splice(orderIndex, 1);
      if (this.editingId && !this.columns.some(col => col.orders.find(o => o.id === this.editingId))) {
        this.cancelEdit();
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
}

h1 {
  font-weight: 600;
  font-size: 1.8rem;
  margin-bottom: 20px;
  text-align: center;
}

.add-order {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  justify-content: center;
}

.add-order input {
  flex: 1;
  padding: 10px 14px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline-offset: 2px;
  transition: border-color 0.3s ease;
}

.add-order input:focus {
  border-color: #5c6ac4;
  outline: none;
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
  flex: 1 1 280px;
  background: #fafafa;
  padding: 15px 12px;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgb(0 0 0 / 0.1);
  min-width: 260px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
}

h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 14px;
  color: #4a4a4a;
  text-align: center;
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

.order-card span {
  flex-grow: 1;
  outline: none;
}

.order-card span:focus {
  background-color: #cfd3e9;
  border-radius: 4px;
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

.edit-input:focus {
  border-color: #3a46a1;
  outline: none;
}

/* Responsive para móviles */
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

