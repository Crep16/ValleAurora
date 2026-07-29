import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'


import HomeView from './views/HomeView.vue'
import UsuarioView from './views/UsuarioView.vue'
import InquilinoView from './views/InquilinoView.vue'
import ServicioView from './views/ServiciosView.vue'
import SucursalView from './views/SucursalView.vue'
import NotFoundView from './views/NotFoundView.vue'
import UbicacionView from './views/UbicacionView.vue'
import DepartamentoView from './views/DepartamentoView.vue'
import PropiedadesView from './views/PropiedadesView.vue'

import './assets/main.css'
import App from './App.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: HomeView, meta: { title: 'Inicio' } },
        { path: '/Usuarios', component: UsuarioView, meta: { title: 'Usuarios' } },
        { path: '/Inquilinos', component: InquilinoView, meta: { title: 'Inquilinos' } },
        { path: '/Servicios', component: ServicioView, meta: { title: 'Servicios' } },
        { path: '/Sucursal', component: SucursalView, meta: { title: 'Sucursales' } },
        { path: '/Ubicacion', component: UbicacionView, meta: { title: 'Ubicaciones' } },
        { path: '/Departamentos', component: DepartamentoView, meta: { title: 'Departamentos' } },
        { path: '/Propiedades', component: PropiedadesView, meta: { title: 'Prodiedades' } },
        { path: '/:pathMatch(.*)*', component: NotFoundView } // No tiene meta.title, se ignorará automáticamente
    ]
})

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.mount('#app');
