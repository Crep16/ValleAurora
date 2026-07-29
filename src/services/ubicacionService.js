import { db } from '@/config/firebase'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'

// Referencia a la colección en Firestore
const collectionRef = collection(db, 'ubicaciones')

// — GET ALL (Firestore) —————
export async function getUbicaciones() {
  try {
    const querySnapshot = await getDocs(collectionRef)
    const ubicaciones = []

    querySnapshot.forEach((doc) => {
      // Mapeamos el ID del documento de Firebase junto con sus datos
      ubicaciones.push({ id: doc.id, ...doc.data() })
    })

    return ubicaciones
  } catch (error) {
    console.error('[ubicacionService] Error en getUbicaciones:', error)
    throw new Error('No se pudieron recuperar las ubicaciones del servidor.')
  }
}

// — GET ONE (Firestore) —————
export async function getUbicacion(id) {
  try {
    const docRef = doc(db, 'ubicaciones', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error(`Ubicación con ID ${id} no encontrada.`)
    }

    return { id: docSnap.id, ...docSnap.data() }
  } catch (error) {
    console.error(`[ubicacionService] Error en getUbicacion (${id}):`, error)
    throw new Error(error.message || 'Error al obtener los detalles de la ubicación.')
  }
}

// — CREATE (Firestore) —————
export async function crearUbicacion(datos) {
  try {
    // Cloud Firestore genera automáticamente hashes alfanuméricos únicos como IDs
    const docRef = await addDoc(collectionRef, datos)
    return { id: docRef.id, ...datos }
  } catch (error) {
    console.error('[ubicacionService] Error en crearUbicacion:', error)
    throw new Error('Error al guardar la nueva ubicación.')
  }
}

// — UPDATE (Firestore) —————
export async function actualizarUbicacion(id, datos) {
  try {
    const docRef = doc(db, 'ubicaciones', id)

    // Evitamos enviar el campo ID dentro del payload de actualización de Firestore
    const { id: _, ...datosAActualizar } = datos
    await updateDoc(docRef, datosAActualizar)

    return { id, ...datosAActualizar }
  } catch (error) {
    console.error(`[ubicacionService] Error en actualizarUbicacion (${id}):`, error)
    throw new Error('Error al actualizar los datos de la ubicacion')
  }
}

// — DELETE (Firestore) —————
export async function eliminarUbicacion(id) {
  try {
    const docRef = doc(db, 'ubicaciones', id)
    await deleteDoc(docRef)
    return { id }
  } catch (error) {
    console.error(`[ubicacionService] Error en eliminarUbicacion (${id}):`, error)
    throw new Error('Error al eliminar la ubicación seleccionada.')
  }
}

// ── GEOCODIFICACIÓN INVERSA (Google Maps Geocoding API) ───────────
// Requiere que la API Key tenga habilitada "Geocoding API"
export function geocodificarInverso(lat, lng) {
  return new Promise((resolve, reject) => {
    // Verificar que el SDK de Google esté cargado en el objeto window
    if (!window.google || !window.google.maps) {
      return reject(new Error('El SDK de Google Maps no está cargado.'))
    }

    const geocoder = new window.google.maps.Geocoder()
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) }

    geocoder.geocode({ location: latlng, language: 'es' }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const componentes = results[0].address_components

          const get = (...tipos) => {
            const c = componentes.find((c) => tipos.every((t) => c.types.includes(t)))
            return c?.long_name ?? ''
          }

          const resultado = {
            calle: get('route'),
            numero: get('street_number'),
            colonia: get('sublocality_level_1') || get('sublocality') || get('neighborhood'),
            ciudad: get('locality') || get('administrative_area_level_2'),
            estado: get('administrative_area_level_1'),
            cp: get('postal_code'),
          }

          if (import.meta.env.DEV) {
            console.debug('[geocodificarInverso] resultado:', resultado)
          }

          resolve(resultado)
        } else {
          reject(new Error('No se encontraron resultados.'))
        }
      } else if (status === 'ZERO_RESULTS') {
        reject(new Error('No se encontró dirección para estas coordenadas.'))
      } else {
        reject(new Error(`Geocodificación fallida debido a: ${status}`))
      }
    })
  })
}

// ── GEOLOCALIZACIÓN DEL NAVEGADOR ─────────────────────────────────
export function obtenerCoordenadas() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no soporta geolocalización'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (err) => {
        const msgs = { 1: 'Permiso denegado', 2: 'Posición no disponible', 3: 'Tiempo agotado' }
        reject(new Error(msgs[err.code] ?? 'Error de geolocalización'))
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  })
}