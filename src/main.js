import { createApp } from 'vue';
import App from './App.vue';
import router from "./router";

const viteApp = createApp(App);
viteApp.use(router);
viteApp.mount("#app");
