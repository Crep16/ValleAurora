import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getPropiedades,
  getPropiedad,
  crearPropiedad,
  actualizarPropiedad,
  eliminarPropiedad,
} from "@/services/propiedadesService";

// Catálogo de tipos: 3 habitacionales + 3 comerciales
export const TIPOS_PROPIEDAD = [
  { grupo: "Habitacional", value: "casa", label: "Casa" },
  { grupo: "Habitacional", value: "departamento", label: "Departamento" },
  { grupo: "Habitacional", value: "loft", label: "Loft" },
  { grupo: "Comercial", value: "local", label: "Local" },
  { grupo: "Comercial", value: "bodega", label: "Bodega" },
  { grupo: "Comercial", value: "oficina", label: "Oficina" },
];

export const ESTADOS_PROPIEDAD = ["Disponible", "Rentado", "En Mantenimiento"];

const FORM_VACIO = () => ({
  nombre: "",
  ubicacionId: null,
  inquilinoId: null,
  numero: "", // casa o local
  piso: "", // departamento o condominio
  metros: "",
  habitaciones: 0, // decimales de .5 en .5
  banos: 0, // decimales de .5 en .5
  rentaMensual: 0, // float
  estado: "Disponible",
  tipo: "",
  notas: "",
});

export const usePropiedadStore = defineStore("propiedades", () => {
  // ── Estado ────────────────────────────────────────────────────
  const lista = ref([]);
  const seleccionada = ref(null);
  const form = ref(FORM_VACIO());
  const modoEdicion = ref(false);
  const cargando = ref(false);
  const guardando = ref(false);
  const eliminando = ref(false);
  const error = ref(null);
  const exito = ref(null);

  // ── Getters ───────────────────────────────────────────────────
  const totalPropiedades = computed(() => lista.value.length);

  // ── Helpers ───────────────────────────────────────────────────
  function _notificar(msg) {
    exito.value = msg;
    setTimeout(() => {
      exito.value = null;
    }, 3500);
  }

  function _validar() {
    if (!form.value.numero) return "El número (casa o local) es obligatorio.";
    if (!form.value.tipo) return "Selecciona un tipo de propiedad.";
    if (form.value.habitaciones % 0.5 !== 0)
      return "Las habitaciones deben avanzar de .5 en .5.";
    if (form.value.banos % 0.5 !== 0)
      return "Los baños deben avanzar de .5 en .5.";
    return null;
  }

  // ── CRUD ──────────────────────────────────────────────────────
  async function cargarLista() {
    cargando.value = true;
    error.value = null;
    try {
      lista.value = await getPropiedades();
    } catch (e) {
      error.value = e.message;
    } finally {
      cargando.value = false;
    }
  }

  function iniciarCrear() {
    form.value = FORM_VACIO();
    seleccionada.value = null;
    modoEdicion.value = false;
    error.value = null;
  }

  async function iniciarEditar(id) {
    error.value = null;
    try {
      const data = await getPropiedad(id);
      form.value = { ...FORM_VACIO(), ...data };
      seleccionada.value = id;
      modoEdicion.value = true;
    } catch (e) {
      error.value = e.message;
    }
  }

  async function guardar() {
    const mensajeValidacion = _validar();
    if (mensajeValidacion) {
      error.value = mensajeValidacion;
      return false;
    }

    guardando.value = true;
    error.value = null;
    try {
      if (modoEdicion.value) {
        const actualizada = await actualizarPropiedad(
          seleccionada.value,
          form.value,
        );
        const idx = lista.value.findIndex((u) => u.id === actualizada.id);
        if (idx !== -1) lista.value[idx] = actualizada;
        _notificar("Propiedad actualizada correctamente.");
      } else {
        const nueva = await crearPropiedad(form.value);
        lista.value.push(nueva);
        _notificar("Propiedad creada correctamente.");
      }
      iniciarCrear();
      return true; //Operación exitosa
    } catch (e) {
      error.value = e.message;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function eliminar(id) {
    eliminando.value = true;
    error.value = null;
    try {
      await eliminarPropiedad(id);
      lista.value = lista.value.filter((u) => u.id !== id);
      if (seleccionada.value === id) iniciarCrear();
      _notificar("Propiedad eliminada.");
    } catch (e) {
      error.value = e.message;
    } finally {
      eliminando.value = false;
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
    totalPropiedades,
    cargarLista,
    iniciarCrear,
    iniciarEditar,
    guardar,
    eliminar,
  };
});