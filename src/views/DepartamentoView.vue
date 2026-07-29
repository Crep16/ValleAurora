<template>
  <DashboardLayout>
    <template #navbar><NavBar /></template>

    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Gestor de Departamentos</h2>
          <p class="text-sm text-slate-400 mt-0.5">
            {{ store.totalDepartamentos }} registro{{ store.totalDepartamentos !== 1 ? 's' : '' }}
          </p>
        </div>

        <button
          @click="store.iniciarCrear(); mostrarForm = true"
          class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuevo departamento
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
          <div v-if="store.cargando" class="p-4 text-sm text-slate-400">Cargando departamentos...</div>
          <table v-else class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th class="p-3">Depto</th>
                <th class="p-3">Piso</th>
                <th class="p-3">Estado</th>
                <th class="p-3">Renta</th>
                <th class="p-3">Inquilino</th>
                <th class="p-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in store.lista" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3 font-medium text-slate-800">
                  {{ item.numero }}
                  <div class="text-xs font-normal text-slate-400 mt-0.5">{{ item.idUbicacion }}</div>
                </td>
                <td class="p-3">{{ item.piso }}</td>
                <td class="p-3">
                  <span :class="['px-2 py-0.5 rounded text-xs font-semibold', estadoEstilo(item.estado)]">
                    {{ item.estado }}
                  </span>
                </td>
                <td class="p-3">{{ formatoMoneda(item.rentaMensual) }}</td>
                <td class="p-3">{{ item.inquilinoActual || '—' }}</td>
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <button @click="editar(item.id)" class="text-indigo-600 hover:text-indigo-700">Editar</button>
                    <button @click="store.eliminar(item.id)" class="text-rose-600 hover:text-rose-700">Eliminar</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!store.lista.length">
                <td colspan="6" class="p-6 text-center text-slate-400">No hay departamentos registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <transition name="slide">
          <div v-if="mostrarForm" class="border border-slate-200 rounded-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 class="text-sm font-semibold text-slate-700">
                {{ store.modoEdicion ? 'Editar departamento' : 'Nuevo departamento' }}
              </h3>
              <button @click="cerrarForm" class="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div class="p-5 space-y-4">
              <div v-if="store.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {{ store.error }}
              </div>

              <fieldset class="space-y-3">
                <legend class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Ubicación</legend>
                <CampoInput v-model="store.form.idUbicacion" label="Ubicación / Edificio" placeholder="EDIF-A" />
                <CampoInput v-model="store.form.numero" label="Número" placeholder="101" />
                <CampoInput v-model.number="store.form.piso" label="Piso" type="number" placeholder="0 si es un solo piso" />
              </fieldset>

              <fieldset class="space-y-3">
                <legend class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Características</legend>
                <CampoInput v-model.number="store.form.m2" label="Metros cuadrados (m²)" type="number" placeholder="65" />
                <CampoInput v-model.number="store.form.habitaciones" label="Habitaciones" type="number" placeholder="2" />
                <CampoInput v-model.number="store.form.banos" label="Baños" type="number" placeholder="1.5" step="0.5" />
              </fieldset>

              <fieldset class="space-y-3">
                <legend class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Renta y estado</legend>
                <CampoInput v-model.number="store.form.rentaMensual" label="Renta mensual (MXN)" type="number" placeholder="8500" />
                <label class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Estado
                  <select v-model="store.form.estado" class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white">
                    <option value="disponible">disponible</option>
                    <option value="rentado">rentado</option>
                    <option value="mantenimiento">mantenimiento</option>
                  </select>
                </label>
              </fieldset>

              <fieldset class="space-y-3">
                <legend class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Inquilino actual</legend>
                <CampoInput v-model="store.form.inquilinoActual" label="Nombre" placeholder="Carlos Mendoza" />
                <CampoInput v-model="store.form.telefonoInquilino" label="Teléfono" placeholder="55 1234 5678" />
                <CampoInput v-model="store.form.fechaInicioContrato" label="Inicio de contrato" type="datetime-local" />
              </fieldset>

              <fieldset class="space-y-3">
                <legend class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Notas</legend>
                <textarea
                  v-model="store.form.notas"
                  rows="2"
                  placeholder="Observaciones adicionales..."
                  class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white"
                ></textarea>
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
import { useDepartamentoStore } from '@/stores/departamentoStore'
import CampoInput from '@/components/CampoInput.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import NavBar from '../components/NavBar.vue'

const store = useDepartamentoStore()
const mostrarForm = ref(false)

const estadoEstilos = {
  disponible: 'bg-emerald-50 text-emerald-700',
  rentado: 'bg-sky-50 text-sky-700',
  mantenimiento: 'bg-amber-50 text-amber-700',
}

function estadoEstilo(valor) {
  return estadoEstilos[valor] || 'bg-slate-50 text-slate-700'
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