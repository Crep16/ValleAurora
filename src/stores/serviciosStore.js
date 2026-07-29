import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
  getServicio,
  getServicios,
} from '@/services/serviciosService'

const FORM_VACIO = () => ({
  nombre: '',
  categoria: 'cuota',
  descripcion: '',
  precioBase: '',
  unidad: 'mensual',
  activo: true,
  requiereProgramacion: false,
  fechaProgramacion: '',
  horaProgramacion: '',
  duracionEstimada: '',
})

export const useServiciosStore = defineStore('servicios', () => {
  const lista = ref([])
  const seleccionada = ref(null)
  const form = ref(FORM_VACIO())
  const modoEdicion = ref(false)
  const cargando = ref(false)
  const guardando = ref(false)
  const eliminando = ref(false)
  const error = ref(null)
  const exito = ref(null)

  const totalServicios = computed(() => lista.value.length)
  const serviciosActivos = computed(() => lista.value.filter(s => s.activo))

  function _notificar(msg) {
    exito.value = msg
    setTimeout(() => { exito.value = null }, 3500)
  }

  async function cargarLista() {
    cargando.value = true
    error.value = null
    try {
      lista.value = await getServicios()
    } catch (e) {
      error.value = e.message
    } finally {
      cargando.value = false
    }
  }

  function iniciarCrear() {
    form.value = FORM_VACIO()
    seleccionada.value = null
    modoEdicion.value = false
    error.value = null
  }

  async function iniciarEditar(id) {
    error.value = null
    try {
      const data = await getServicio(id)
      form.value = { ...data }
      seleccionada.value = id
      modoEdicion.value = true
    } catch (e) {
      error.value = e.message
    }
  }

  async function guardar() {
    guardando.value = true
    error.value = null
    try {
      if (modoEdicion.value) {
        const actualizado = await actualizarServicio(seleccionada.value, form.value)
        const idx = lista.value.findIndex((item) => item.id === actualizado.id)
        if (idx !== -1) lista.value[idx] = actualizado
        _notificar('Servicio actualizado correctamente.')
      } else {
        const nuevo = await crearServicio(form.value)
        lista.value.push(nuevo)
        _notificar('Servicio creado correctamente.')
      }
      iniciarCrear()
    } catch (e) {
      error.value = e.message
    } finally {
      guardando.value = false
    }
  }

  async function eliminar(id) {
    eliminando.value = true
    error.value = null
    try {
      await eliminarServicio(id)
      lista.value = lista.value.filter((item) => item.id !== id)
      if (seleccionada.value === id) iniciarCrear()
      _notificar('Servicio eliminado.')
    } catch (e) {
      error.value = e.message
    } finally {
      eliminando.value = false
    }
  }

  return {
    lista,
    seleccionada,
    form,
    modoEdicion,
    cargando,
    guardando,
    eliminando,
    error,
    exito,
    totalServicios,
    serviciosActivos,
    cargarLista,
    iniciarCrear,
    iniciarEditar,
    guardar,
    eliminar,
  }
})
