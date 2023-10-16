import { createRouter, createWebHashHistory } from 'vue-router';
import BusinessAdd from  '@/pages/BusinessAdd.vue';
import BusinessList from  '@/pages/BusinessList.vue';
const routes = [
  { path: '/', component: BusinessAdd },
  { path: '/business-list', component: BusinessList },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;