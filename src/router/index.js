import { createRouter, createWebHashHistory } from 'vue-router';
import BusinessAdd from  '@/pages/BusinessAdd.vue';
const routes = [
  { path: '/', component: BusinessAdd }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;