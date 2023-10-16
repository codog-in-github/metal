import { createApp } from 'vue';
import App from './App.vue';
import { createVuestic } from 'vuestic-ui';
import router from '@/router';
import 'vuestic-ui/css';
import 'material-icons/iconfont/material-icons.css';

const app = createApp(App);
app.use(createVuestic());
app.use(router);
app.mount('#app');
