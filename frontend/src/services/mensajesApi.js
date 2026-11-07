import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseListo } from './firebase'

// Cualquier visitante puede crear un mensaje; solo el admin puede leerlos (ver firestore.rules).
export async function enviarMensaje({ name, email, message }) {
  if (!firebaseListo) throw new Error('Firebase no está configurado todavía.')
  await addDoc(collection(db, 'messages'), {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: serverTimestamp(),
    read: false,
  })
}

export async function listarMensajes() {
  const snap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const marcarLeido = (id, read) => updateDoc(doc(db, 'messages', id), { read })
export const eliminarMensaje = (id) => deleteDoc(doc(db, 'messages', id))
