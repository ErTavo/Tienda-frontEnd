import { createRouter, createWebHistory } from 'vue-router';
import LoginBoard from '../components/LoginBoard.vue';
import KanbanBoard from '../components/KanbanBoard.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginBoard },
  { path: '/orders', component: KanbanBoard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;