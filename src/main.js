import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'


import HomeView from './views/HomeView.vue'
import UsuarioView from './views/UsuarioView.vue'
import InquilinoView from './views/InquilinoView.vue'
import ServicioView from './views/ServiciosView.vue'
import SucursalView from './views/SucursalView.vue'

import './assets/main.css'
import App from './App.vue'

const router = createRouter({
    history:createWebHistory(),
    routes:[
        {path:'/', component:HomeView},
        {path:'/Usuarios', component:UsuarioView},
        {path:'/Inquilinos', component:InquilinoView},
        {path:'/Servicios', component:ServicioView},
        { path: '/Sucursal', component: SucursalView }
    ]
})

const app= createApp(App);

app.use(router);
app.mount('#app');
