<template>
  <div id="app">
    <KanbanBoard />
  </div>
</template>

<script>
import KanbanBoard from "./components/KanbanBoard.vue";

export default {
  name: "App",
  components: {
    KanbanBoard,
  },
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  background-color: #e8eff0; 
  height: 100%;
  font-family: Arial, sans-serif;
}
</style>