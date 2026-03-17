import { useEffect, useState } from 'react'
import { getMe, login, register, type UserResponse } from '../services/api'
import { getAccessToken, setAccessToken } from '../utils/storage'

export function useAuth() {
  const [token, setToken] = useState<string | null>(getAccessToken())
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getMe(token)
      .then(setUser)
      .catch((e: { message: string }) => {
        setError(e.message)
        setToken(null)
        setAccessToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const auth = await login(email, password)
      setAccessToken(auth.access_token)
      setToken(auth.access_token)
    } catch (e) {
      setError((e as { message?: string }).message ?? 'Login failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (email: string, password: string, username: string) => {
    setLoading(true)
    setError(null)
    try {
      await register(email, password, username)
    } catch (e) {
      setError((e as { message?: string }).message ?? 'Register failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAccessToken(null)
    setToken(null)
    setUser(null)
  }

  return { token, user, loading, error, login: handleLogin, register: handleRegister, logout }
}
