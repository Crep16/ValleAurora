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

const collectionRef = collection(db, 'inquilinos')

function normalizarInquilino(datos) {
  return {
    idDepartamento: datos.idDepartamento || '',
    nombre: datos.nombre || '',
    apellidos: datos.apellidos || '',
    telefono: datos.telefono || '',
    celular: datos.celular || '',
    correo: datos.correo || '',
    fechaInicio: datos.fechaInicio || '',
    fechaFin: datos.fechaFin || '',
    rentaMensual: Number(datos.rentaMensual) || 0,
    deposito: Number(datos.deposito) || 0,
    estado: datos.estado || 'activo',
    creado: datos.creado || new Date().toISOString(),
    actualizado: new Date().toISOString(),
  }
}

export async function getInquilinos() {
  try {
    const snapshot = await getDocs(collectionRef)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  } catch (error) {
    console.error('[inquilinoService] Error en getInquilinos:', error)
    throw new Error('No se pudieron recuperar los inquilinos del servidor.')
  }
}

export async function getInquilino(id) {
  try {
    const docRef = doc(db, 'inquilinos', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error(`Inquilino con ID ${id} no encontrado.`)
    }

    return { id: docSnap.id, ...docSnap.data() }
  } catch (error) {
    console.error(`[inquilinoService] Error en getInquilino (${id}):`, error)
    throw new Error(error.message || 'Error al obtener el inquilino.')
  }
}

export async function crearInquilino(datos) {
  try {
    const payload = normalizarInquilino(datos)
    const docRef = await addDoc(collectionRef, payload)
    return { id: docRef.id, ...payload }
  } catch (error) {
    console.error('[inquilinoService] Error en crearInquilino:', error)
    throw new Error('Error al guardar el inquilino.')
  }
}

export async function actualizarInquilino(id, datos) {
  try {
    const docRef = doc(db, 'inquilinos', id)
    const { id: _, ...datosAActualizar } = datos
    const payload = normalizarInquilino({ ...datosAActualizar, actualizado: new Date().toISOString() })
    await updateDoc(docRef, payload)
    return { id, ...payload }
  } catch (error) {
    console.error(`[inquilinoService] Error en actualizarInquilino (${id}):`, error)
    throw new Error('Error al actualizar el inquilino.')
  }
}

export async function eliminarInquilino(id) {
  try {
    const docRef = doc(db, 'inquilinos', id)
    await deleteDoc(docRef)
    return { id }
  } catch (error) {
    console.error(`[inquilinoService] Error en eliminarInquilino (${id}):`, error)
    throw new Error('Error al eliminar el inquilino.')
  }
}
