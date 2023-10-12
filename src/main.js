import { createApp } from 'vue';
import App from './App.vue';
import { createVuestic } from 'vuestic-ui';
import router from '@/router';
import '@/assets/styles/icon.scss';
import 'vuestic-ui/css';

const app = createApp(App);
app.use(createVuestic());
app.use(router);
app.mount('#app');
