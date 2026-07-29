import { db } from '@/config/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'

const collectionRef = collection(db, 'servicios')

function normalizarServicio(datos) {
  return {
    nombre: datos.nombre || '',
    categoria: datos.categoria || 'cuota',
    descripcion: datos.descripcion || '',
    precioBase: Number(datos.precioBase) || 0,
    unidad: datos.unidad || 'mensual',
    activo: datos.activo !== undefined ? datos.activo : true,
    requiereProgramacion: datos.requiereProgramacion !== undefined ? datos.requiereProgramacion : false,
    fechaProgramacion: datos.requiereProgramacion ? (datos.fechaProgramacion || '') : '',
    horaProgramacion: datos.requiereProgramacion ? (datos.horaProgramacion || '') : '',
    duracionEstimada: datos.duracionEstimada || '',
    creadoAt: datos.creadoAt || new Date().toISOString(),
    actualizadoAt: new Date().toISOString(),
  }
}

export async function getServicios() {
  try {
    const snapshot = await getDocs(collectionRef)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  } catch (error) {
    console.error('[serviciosService] Error en getServicios:', error)
    throw new Error('No se pudieron recuperar los servicios del servidor.')
  }
}

export async function getServicio(id) {
  try {
    const docRef = doc(db, 'servicios', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error(`Servicio con ID ${id} no encontrado.`)
    }

    return { id: docSnap.id, ...docSnap.data() }
  } catch (error) {
    console.error(`[serviciosService] Error en getServicio (${id}):`, error)
    throw new Error(error.message || 'Error al obtener el servicio.')
  }
}

export async function crearServicio(datos) {
  try {
    const payload = normalizarServicio(datos)
    const docRef = await addDoc(collectionRef, payload)
    return { id: docRef.id, ...payload }
  } catch (error) {
    console.error('[serviciosService] Error en crearServicio:', error)
    throw new Error('Error al guardar el servicio.')
  }
}

export async function actualizarServicio(id, datos) {
  try {
    const docRef = doc(db, 'servicios', id)
    const { id: _, ...datosAActualizar } = datos
    const payload = normalizarServicio({ ...datosAActualizar, actualizadoAt: new Date().toISOString() })
    await updateDoc(docRef, payload)
    return { id, ...payload }
  } catch (error) {
    console.error(`[serviciosService] Error en actualizarServicio (${id}):`, error)
    throw new Error('Error al actualizar el servicio.')
  }
}

export async function eliminarServicio(id) {
  try {
    const docRef = doc(db, 'servicios', id)
    await deleteDoc(docRef)
    return { id }
  } catch (error) {
    console.error(`[serviciosService] Error en eliminarServicio (${id}):`, error)
    throw new Error('Error al eliminar el servicio.')
  }
}
