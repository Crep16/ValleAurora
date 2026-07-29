import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  actualizarDepartamento,
  crearDepartamento,
  eliminarDepartamento,
  getDepartamento,
  getDepartamentos,
} from '@/services/departamentoService'

const FORM_VACIO = () => ({
  idUbicacion: '',
  numero: '',
  piso: 0,
  m2: '',
  habitaciones: '',
  banos: '',
  rentaMensual: '',
  estado: 'disponible',
  inquilinoActual: '',
  telefonoInquilino: '',
  fechaInicioContrato: '',
  notas: '',
})

export const useDepartamentoStore = defineStore('departamento', () => {
  const lista = ref([])
  const seleccionada = ref(null)
  const form = ref(FORM_VACIO())
  const modoEdicion = ref(false)
  const cargando = ref(false)
  const guardando = ref(false)
  const eliminando = ref(false)
  const error = ref(null)
  const exito = ref(null)

  const totalDepartamentos = computed(() => lista.value.length)
  const departamentosDisponibles = computed(() => lista.value.filter((d) => d.estado === 'disponible'))

  function _notificar(msg) {
    exito.value = msg
    setTimeout(() => { exito.value = null }, 3500)
  }

  async function cargarLista() {
    cargando.value = true
    error.value = null
    try {
      lista.value = await getDepartamentos()
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
      const data = await getDepartamento(id)
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
        const actualizado = await actualizarDepartamento(seleccionada.value, form.value)
        const idx = lista.value.findIndex((item) => item.id === actualizado.id)
        if (idx !== -1) lista.value[idx] = actualizado
        _notificar('Departamento actualizado correctamente.')
      } else {
        const nuevo = await crearDepartamento(form.value)
        lista.value.push(nuevo)
        _notificar('Departamento creado correctamente.')
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
      await eliminarDepartamento(id)
      lista.value = lista.value.filter((item) => item.id !== id)
      if (seleccionada.value === id) iniciarCrear()
      _notificar('Departamento eliminado.')
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
    totalDepartamentos,
    departamentosDisponibles,
    cargarLista,
    iniciarCrear,
    iniciarEditar,
    guardar,
    eliminar,
  }
})