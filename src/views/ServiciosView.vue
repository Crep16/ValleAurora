<template>
  <DashboardLayout>
    <template #navbar><NavBar /></template>

    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Catálogo de Servicios</h2>
          <p class="text-sm text-slate-400 mt-0.5">
            {{ store.totalServicios }} registro{{ store.totalServicios !== 1 ? 's' : '' }}
            · {{ store.serviciosActivos.length }} activo{{ store.serviciosActivos.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <button
          @click="store.iniciarCrear(); mostrarForm = true"
          class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuevo servicio
        </button>
      </div>

      <transition name="fade">
        <div v-if="store.exito" class="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {{ store.exito }}
        </div>
      </transition>

      <div v-if="store.error && !mostrarForm" class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
        {{ store.error }}
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
        <div class="overflow-x-auto rounded-xl border border-slate-100">
          <div v-if="store.cargando" class="p-4 text-sm text-slate-400">Cargando servicios...</div>
          <table v-else class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th class="p-3">Servicio</th>
                <th class="p-3">Categoría</th>
                <th class="p-3">Precio</th>
                <th class="p-3">Estado</th>
                <th class="p-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in store.lista" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3 font-medium text-slate-800">
                  {{ item.nombre }}
                  <div v-if="item.requiereProgramacion" class="text-xs font-normal text-slate-400 mt-0.5">
                    Requiere programación
                  </div>
                </td>
                <td class="p-3">
                  <span :class="['px-2 py-0.5 rounded text-xs font-semibold', categoriaEstilo(item.categoria)]">
                    {{ categoriaLabel(item.categoria) }}
                  </span>
                </td>
                <td class="p-3">
                  {{ formatoMoneda(item.precioBase) }}
                  <span class="text-slate-400">/ {{ unidadLabel(item.unidad) }}</span>
                </td>
                <td class="p-3">
                  <span :class="['px-2 py-0.5 rounded text-xs font-semibold', item.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700']">
                    {{ item.activo ? 'activo' : 'inactivo' }}
                  </span>
                </td>
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <button @click="editar(item.id)" class="text-indigo-600 hover:text-indigo-700">Editar</button>
                    <button @click="store.eliminar(item.id)" class="text-rose-600 hover:text-rose-700">Eliminar</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!store.lista.length">
                <td colspan="5" class="p-6 text-center text-slate-400">No hay servicios registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <transition name="slide">
          <div v-if="mostrarForm" class="border border-slate-200 rounded-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 class="text-sm font-semibold text-slate-700">
                {{ store.modoEdicion ? 'Editar servicio' : 'Nuevo servicio' }}
              </h3>
              <button @click="cerrarForm" class="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div class="p-5 space-y-4">
              <div v-if="store.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {{ store.error }}
              </div>

              <fieldset class="space-y-3">
                <legend class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Datos generales</legend>
                <CampoInput v-model="store.form.nombre" label="Nombre" placeholder="Cuota de mantenimiento" />

                <label class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Categoría
                  <select v-model="store.form.categoria" class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white">
                    <option v-for="cat in categorias" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
                  </select>
                </label>

                <label class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Unidad
                  <select v-model="store.form.unidad" class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white">
                    <option v-for="uni in unidades" :key="uni.value" :value="uni.value">{{ uni.label }}</option>
                  </select>
                </label>

                <CampoInput v-model.number="store.form.precioBase" label="Precio base (MXN)" type="number" placeholder="1200" />

                <label class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Descripción
                  <textarea
                    v-model="store.form.descripcion"
                    rows="2"
                    placeholder="Detalles adicionales del servicio..."
                    class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white normal-case tracking-normal font-normal"
                  ></textarea>
                </label>

                <CampoInput v-model="store.form.duracionEstimada" label="Duración estimada" placeholder="2 horas" />
              </fieldset>

              <fieldset class="space-y-3">
                <legend class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Programación y estado</legend>

                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input v-model="store.form.requiereProgramacion" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  ¿Requiere programación?
                </label>

                <div v-if="store.form.requiereProgramacion" class="grid grid-cols-2 gap-3">
                  <CampoInput v-model="store.form.fechaProgramacion" label="Fecha" type="date" />
                  <CampoInput v-model="store.form.horaProgramacion" label="Hora" type="time" />
                </div>

                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input v-model="store.form.activo" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  Servicio activo
                </label>
              </fieldset>
            </div>

            <div class="flex justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
              <button @click="cerrarForm" class="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                Cancelar
              </button>
              <button @click="store.guardar()" :disabled="store.guardando" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                {{ store.guardando ? 'Guardando…' : store.modoEdicion ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useServiciosStore } from '@/stores/serviciosStore'
import CampoInput from '@/components/CampoInput.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import NavBar from '../components/NavBar.vue'

const store = useServiciosStore()
const mostrarForm = ref(false)

const categorias = [
  { value: 'amenidad', label: 'Amenidad' },
  { value: 'cuota', label: 'Cuota' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'reparacion', label: 'Reparación' },
]

const unidades = [
  { value: 'evento', label: 'Evento' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'hora', label: 'Hora' },
  { value: 'm2', label: 'm²' },
]

const categoriaEstilos = {
  amenidad: 'bg-sky-50 text-sky-700',
  cuota: 'bg-violet-50 text-violet-700',
  mantenimiento: 'bg-amber-50 text-amber-700',
  reparacion: 'bg-rose-50 text-rose-700',
}

function categoriaLabel(valor) {
  return categorias.find((c) => c.value === valor)?.label || valor
}

function categoriaEstilo(valor) {
  return categoriaEstilos[valor] || 'bg-slate-50 text-slate-700'
}

function unidadLabel(valor) {
  return unidades.find((u) => u.value === valor)?.label || valor
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor || 0)
}

onMounted(() => store.cargarLista())

async function editar(id) {
  store.iniciarEditar(id)
  mostrarForm.value = true
}

function cerrarForm() {
  mostrarForm.value = false
  store.iniciarCrear()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateX(16px); }
</style>