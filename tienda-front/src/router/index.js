import { createRouter, createWebHistory } from 'vue-router';
import LoginBoard from '../components/LoginBoard.vue';
import KanbanBoard from '../components/KanbanBoard.vue';
import MenuPrincipal from '@/components/MenuPrincipal.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginBoard },
  { path: '/orders', component: KanbanBoard },
  { path: '/menu', component: MenuPrincipal },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;