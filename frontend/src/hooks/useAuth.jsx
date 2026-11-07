import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, firebaseListo } from '../services/firebase'

const AuthContext = createContext(null)

// Un usuario es "admin" solo si existe el documento admins/{uid} en Firestore.
// Es la misma comprobación que hacen las reglas de seguridad, así que la interfaz y el servidor coinciden.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [cargando, setCargando] = useState(firebaseListo)

  useEffect(() => {
    if (!firebaseListo) return undefined
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'admins', u.uid))
          setEsAdmin(snap.exists())
        } catch {
          setEsAdmin(false)
        }
      } else {
        setEsAdmin(false)
      }
      setCargando(false)
    })
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, esAdmin, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
