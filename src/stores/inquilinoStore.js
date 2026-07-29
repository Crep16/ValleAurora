import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  actualizarInquilino,
  crearInquilino,
  eliminarInquilino,
  getInquilino,
  getInquilinos,
} from '@/services/inquilinoService'

const FORM_VACIO = () => ({
  idDepartamento: '',
  nombre: '',
  apellidos: '',
  telefono: '',
  celular: '',
  correo: '',
  fechaInicio: '',
  fechaFin: '',
  rentaMensual: '',
  deposito: '',
  estado: 'activo',
})

export const useInquilinoStore = defineStore('inquilino', () => {
  const lista = ref([])
  const seleccionada = ref(null)
  const form = ref(FORM_VACIO())
  const modoEdicion = ref(false)
  const cargando = ref(false)
  const guardando = ref(false)
  const eliminando = ref(false)
  const error = ref(null)
  const exito = ref(null)

  const totalInquilinos = computed(() => lista.value.length)

  function _notificar(msg) {
    exito.value = msg
    setTimeout(() => { exito.value = null }, 3500)
  }

  async function cargarLista() {
    cargando.value = true
    error.value = null
    try {
      lista.value = await getInquilinos()
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
      const data = await getInquilino(id)
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
        const actualizada = await actualizarInquilino(seleccionada.value, form.value)
        const idx = lista.value.findIndex((item) => item.id === actualizada.id)
        if (idx !== -1) lista.value[idx] = actualizada
        _notificar('Inquilino actualizado correctamente.')
      } else {
        const nuevo = await crearInquilino(form.value)
        lista.value.push(nuevo)
        _notificar('Inquilino creado correctamente.')
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
      await eliminarInquilino(id)
      lista.value = lista.value.filter((item) => item.id !== id)
      if (seleccionada.value === id) iniciarCrear()
      _notificar('Inquilino eliminado.')
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
    totalInquilinos,
    cargarLista,
    iniciarCrear,
    iniciarEditar,
    guardar,
    eliminar,
  }
})
