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

const collectionRef = collection(db, 'departamentos')

function normalizarDepartamento(datos) {
  return {
    idUbicacion: datos.idUbicacion || '',
    numero: datos.numero || '',
    piso: Number(datos.piso) || 0,
    m2: Number(datos.m2) || 0,
    habitaciones: Number(datos.habitaciones) || 0,
    banos: Number(datos.banos) || 0,
    rentaMensual: Number(datos.rentaMensual) || 0,
    estado: datos.estado || 'disponible',
    inquilinoActual: datos.inquilinoActual || '',
    telefonoInquilino: datos.telefonoInquilino || '',
    fechaInicioContrato: datos.fechaInicioContrato || '',
    notas: datos.notas || '',
    creado: datos.creado || new Date().toISOString(),
    actualizado: new Date().toISOString(),
  }
}

export async function getDepartamentos() {
  try {
    const snapshot = await getDocs(collectionRef)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  } catch (error) {
    console.error('[departamentoService] Error en getDepartamentos:', error)
    throw new Error('No se pudieron recuperar los departamentos del servidor.')
  }
}

export async function getDepartamento(id) {
  try {
    const docRef = doc(db, 'departamentos', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error(`Departamento con ID ${id} no encontrado.`)
    }

    return { id: docSnap.id, ...docSnap.data() }
  } catch (error) {
    console.error(`[departamentoService] Error en getDepartamento (${id}):`, error)
    throw new Error(error.message || 'Error al obtener el departamento.')
  }
}

export async function crearDepartamento(datos) {
  try {
    const payload = normalizarDepartamento(datos)
    const docRef = await addDoc(collectionRef, payload)
    return { id: docRef.id, ...payload }
  } catch (error) {
    console.error('[departamentoService] Error en crearDepartamento:', error)
    throw new Error('Error al guardar el departamento.')
  }
}

export async function actualizarDepartamento(id, datos) {
  try {
    const docRef = doc(db, 'departamentos', id)
    const { id: _, ...datosAActualizar } = datos
    const payload = normalizarDepartamento({ ...datosAActualizar, actualizado: new Date().toISOString() })
    await updateDoc(docRef, payload)
    return { id, ...payload }
  } catch (error) {
    console.error(`[departamentoService] Error en actualizarDepartamento (${id}):`, error)
    throw new Error('Error al actualizar el departamento.')
  }
}

export async function eliminarDepartamento(id) {
  try {
    const docRef = doc(db, 'departamentos', id)
    await deleteDoc(docRef)
    return { id }
  } catch (error) {
    console.error(`[departamentoService] Error en eliminarDepartamento (${id}):`, error)
    throw new Error('Error al eliminar el departamento.')
  }
}