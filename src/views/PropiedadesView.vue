<template>
  <DashboardLayout>
    <template #navbar><NavBar /></template>

    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5"
      >
        <div>
          <h2 class="text-xl font-bold text-slate-800">Propiedades</h2>
          <p class="text-sm text-slate-400 mt-0.5">
            {{ store.totalPropiedades }} registro{{
              store.totalPropiedades !== 1 ? "s" : ""
            }}
          </p>
        </div>

        <button
          @click="
            store.iniciarCrear();
            mostrarForm = true;
          "
          class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nueva propiedad
        </button>
      </div>

      <transition name="fade">
        <div
          v-if="store.exito"
          class="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700"
        >
          {{ store.exito }}
        </div>
      </transition>

      <div
        v-if="store.error && !mostrarForm"
        class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600"
      >
        {{ store.error }}
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
        <div class="overflow-x-auto rounded-xl border border-slate-100">
          <div v-if="store.cargando" class="p-4 text-sm text-slate-400">
            Cargando propiedades...
          </div>
          <table v-else class="w-full text-left text-sm text-slate-600">
            <thead
              class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100"
            >
              <tr>
                <th class="p-3">Propiedad</th>
                <th class="p-3">Tipo</th>
                <th class="p-3">Ubicación</th>
                <th class="p-3">Inquilino</th>
                <th class="p-3">Estado</th>
                <th class="p-3">Renta</th>
                <th class="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="item in store.lista"
                :key="item.id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <td class="p-3 font-medium text-slate-800">
                  {{ item.nombre || "Sin nombre" }}
                  <div class="text-xs font-normal text-slate-400">
                    #{{ item.numero }} · Piso {{ item.piso }}
                  </div>
                </td>
                <td class="p-3">{{ tipoEtiqueta(item.tipo) }}</td>
                <td class="p-3">{{ getNombreUbicacion(item.ubicacionId) }}</td>
                <td class="p-3">{{ getNombreInquilino(item.inquilinoId) }}</td>
                <td class="p-3">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-xs font-semibold',
                      estadoClase(item.estado),
                    ]"
                  >
                    {{ item.estado }}
                  </span>
                </td>
                <td class="p-3">${{ item.rentaMensual }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-2 justify-end">
                    <button
                      @click="editar(item.id)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Editar"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path
                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="confirmarEliminar(item)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path
                          d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                        />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!store.lista.length">
                <td colspan="7" class="p-6 text-center text-slate-400">
                  Aún no hay propiedades registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <transition name="slide">
          <div
            v-if="mostrarForm"
            class="border border-slate-200 rounded-2xl overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50"
            >
              <h3 class="text-sm font-semibold text-slate-700">
                {{ store.modoEdicion ? "Editar propiedad" : "Nueva propiedad" }}
              </h3>
              <button
                @click="cerrarForm"
                class="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div
                v-if="store.error"
                class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600"
              >
                {{ store.error }}
              </div>

              <fieldset class="space-y-3">
                <legend
                  class="text-xs font-semibold text-indigo-600 uppercase tracking-widest"
                >
                  Datos generales
                </legend>
                <CampoInput
                  v-model="store.form.nombre"
                  label="Nombre"
                  placeholder="Torre A - 3B"
                />
                <CampoInput
                  v-model="store.form.numero"
                  label="Número (casa o local)"
                  placeholder="101"
                />
                <CampoInput
                  v-model="store.form.piso"
                  label="Piso (departamento o condominio)"
                  placeholder="3"
                />
              </fieldset>

              <fieldset class="space-y-3">
                <legend
                  class="text-xs font-semibold text-indigo-600 uppercase tracking-widest"
                >
                  Asignación
                </legend>
                <label
                  class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide"
                >
                  Ubicación
                  <select
                    v-model="store.form.ubicacionId"
                    class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white normal-case"
                  >
                    <option :value="null">Sin asignar</option>
                    <option
                      v-for="u in ubicacionStore.lista"
                      :key="u.id"
                      :value="u.id"
                    >
                      {{ u.nombre }}
                    </option>
                  </select>
                </label>
                <label
                  class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide"
                >
                  Inquilino
                  <select
                    v-model="store.form.inquilinoId"
                    class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white normal-case"
                  >
                    <option :value="null">Sin asignar</option>
                    <option
                      v-for="i in inquilinoStore.lista"
                      :key="i.id"
                      :value="i.id"
                    >
                      {{ i.nombre }} {{ i.apellidos }}
                    </option>
                  </select>
                </label>
              </fieldset>

              <fieldset class="space-y-3">
                <legend
                  class="text-xs font-semibold text-indigo-600 uppercase tracking-widest"
                >
                  Características
                </legend>
                <CampoInput
                  v-model.number="store.form.metros"
                  label="Metros cuadrados"
                  type="number"
                  placeholder="65"
                />
                <CampoInput
                  v-model.number="store.form.habitaciones"
                  label="Habitaciones"
                  type="number"
                  step="0.5"
                  min="0"
                />
                <CampoInput
                  v-model.number="store.form.banos"
                  label="Baños"
                  type="number"
                  step="0.5"
                  min="0"
                />
                <label
                  class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide"
                >
                  Tipo
                  <select
                    v-model="store.form.tipo"
                    class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white normal-case"
                  >
                    <option value="" disabled>Selecciona un tipo</option>
                    <optgroup label="Habitacional">
                      <option
                        v-for="t in tiposHabitacionales"
                        :key="t.value"
                        :value="t.value"
                      >
                        {{ t.label }}
                      </option>
                    </optgroup>
                    <optgroup label="Comercial">
                      <option
                        v-for="t in tiposComerciales"
                        :key="t.value"
                        :value="t.value"
                      >
                        {{ t.label }}
                      </option>
                    </optgroup>
                  </select>
                </label>
              </fieldset>

              <fieldset class="space-y-3">
                <legend
                  class="text-xs font-semibold text-indigo-600 uppercase tracking-widest"
                >
                  Renta y estado
                </legend>
                <CampoInput
                  v-model.number="store.form.rentaMensual"
                  label="Renta mensual"
                  type="number"
                  step="0.01"
                  min="0"
                />
                <label
                  class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide"
                >
                  Estado
                  <select
                    v-model="store.form.estado"
                    class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white normal-case"
                  >
                    <option v-for="e in ESTADOS_PROPIEDAD" :key="e" :value="e">
                      {{ e }}
                    </option>
                  </select>
                </label>
                <label
                  class="flex flex-col gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide"
                >
                  Notas
                  <textarea
                    v-model="store.form.notas"
                    rows="3"
                    class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white normal-case resize-none"
                    placeholder="Observaciones adicionales…"
                  ></textarea>
                </label>
              </fieldset>
            </div>

            <div
              class="flex justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50"
            >
              <button
                @click="cerrarForm"
                class="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="ejecutarGuardar"
                :disabled="store.guardando"
                class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {{
                  store.guardando
                    ? "Guardando…"
                    : store.modoEdicion
                      ? "Actualizar"
                      : "Guardar"
                }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Confirmación de eliminación -->
    <transition name="fade">
      <div
        v-if="itemAEliminar"
        class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4"
        >
          <h3 class="text-base font-semibold text-slate-800">
            ¿Eliminar propiedad?
          </h3>
          <p class="text-sm text-slate-500">
            Se eliminará
            <span class="font-medium text-slate-700">{{
              itemAEliminar.nombre || "#" + itemAEliminar.numero
            }}</span>
            de forma permanente. Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3 pt-2">
            <button
              @click="itemAEliminar = null"
              class="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarEliminar"
              :disabled="store.eliminando"
              class="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60 transition-colors"
            >
              {{ store.eliminando ? "Eliminando…" : "Eliminar" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  usePropiedadStore,
  TIPOS_PROPIEDAD,
  ESTADOS_PROPIEDAD,
} from "../stores/propiedadesStore.js";
import { useUbicacionStore } from "../stores/ubicacionStore.js";
import { useInquilinoStore } from "../stores/inquilinoStore.js";

/**DashBoard y Menu */
import CampoInput from "@/components/CampoInput.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import NavBar from "../components/NavBar.vue";

const store = usePropiedadStore();
const ubicacionStore = useUbicacionStore();
const inquilinoStore = useInquilinoStore();

const mostrarForm = ref(false);
const itemAEliminar = ref(null);

const tiposHabitacionales = computed(() =>
  TIPOS_PROPIEDAD.filter((t) => t.grupo === "Habitacional"),
);
const tiposComerciales = computed(() =>
  TIPOS_PROPIEDAD.filter((t) => t.grupo === "Comercial"),
);

onMounted(() => {
  store.cargarLista();
  ubicacionStore.cargarLista();
  inquilinoStore.cargarLista();
});

function getNombreUbicacion(id) {
  const ubicacion = ubicacionStore.lista.find((u) => u.id === id);
  return ubicacion ? ubicacion.nombre : "Sin ubicación";
}

function getNombreInquilino(id) {
  const inquilino = inquilinoStore.lista.find((i) => i.id === id);
  return inquilino
    ? `${inquilino.nombre} ${inquilino.apellidos ?? ""}`.trim()
    : "Sin asignar";
}

function tipoEtiqueta(value) {
  return TIPOS_PROPIEDAD.find((t) => t.value === value)?.label ?? value;
}

const data_estado = {
  Disponible: "bg-emerald-50 text-emerald-700",
  Rentado: "bg-indigo-50 text-indigo-700",
  "En Mantenimiento": "bg-amber-50 text-amber-700",
};
function estadoClase(e) {
  return data_estado[e] ?? "bg-slate-100 text-slate-600";
}

async function editar(id) {
  await store.iniciarEditar(id);
  mostrarForm.value = true;
}

function cerrarForm() {
  mostrarForm.value = false;
  store.iniciarCrear();
}

function confirmarEliminar(item) {
  itemAEliminar.value = item;
}

async function ejecutarEliminar() {
  await store.eliminar(itemAEliminar.value.id);
  itemAEliminar.value = null;
}

// Ejecutar Guardar
async function ejecutarGuardar() {
  const exito = await store.guardar();
  if (exito) {
    mostrarForm.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>