import { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/firebase'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return { login, logout, loading, error }
}
