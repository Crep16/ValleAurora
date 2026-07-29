import { db } from "@/config/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Referencia a la colección en Firestore
const collectionRef = collection(db, "propiedades");

// --- GET ALL (Firestore) -------------------------------------------
export async function getPropiedades() {
  try {
    const querySnapshot = await getDocs(collectionRef);
    const propiedades = [];

    querySnapshot.forEach((doc) => {
      // Mapear el ID del documento de Firebase junto con sus datos
      propiedades.push({ id: doc.id, ...doc.data() });
    });

    return propiedades;
  } catch (error) {
    console.error("[propiedadesService] Error en getPropiedades: ", error);
    throw new Error("No se pudieron obtener las propiedades del servidor");
  }
}

// --- GET ONE (Firestore) -------------------------------------------
export async function getPropiedad(id) {
  try {
    const docRef = doc(db, "propiedades", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Propiedad con ID ${id} no encontrada.`);
    }
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error(
      `[propiedadesService] Error en getPropiedad (${id}): `,
      error,
    );
    throw new Error(
      error.message || "Error al obtener los detalles de la propiedad.",
    );
  }
}

// --- CREATE (Firestore) -------------------------------------------
export async function crearPropiedad(datos) {
  try {
    const docRef = await addDoc(collectionRef, datos);
    return { id: docRef.id, ...datos };
  } catch (error) {
    console.error("[propiedadesService] Error en crearPropiedad: ", error);
    throw new Error("Error al guardar la nueva propiedad");
  }
}

// --- UPDATE (Firestore) -------------------------------------------
export async function actualizarPropiedad(id, datos) {
  try {
    const docRef = doc(db, "propiedades", id);

    const { id: _, ...datosActualizar } = datos;

    await updateDoc(docRef, datosActualizar);
    return { id, ...datosActualizar };
  } catch (error) {
    console.error(
      `[propiedadesService] Error en actualizarPropiedad (${id}): `,
      error,
    );
    throw new Error("Error al actualizar los datos de la propiedad.");
  }
}

// --- DELETE (Firestore) -------------------------------------------
export async function eliminarPropiedad(id) {
  try {
    const docRef = doc(db, "propiedades", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(
      `[propiedadesService] Error en eliminarPropiedad (${id}): `,
      error,
    );
    throw new Error("Error al intentar eliminar la propiedad.");
  }
}