import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabaseClient'
import type { Role, UserProfile } from '../types'

const MASTER_ADMIN_EMAIL = 'borbaggabriel@gmail.com'

type AuthContextValue = {
  user: UserProfile | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; profile?: UserProfile; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  destinationForRole: (role?: Role | null) => string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const destinationForRole = (role?: Role | null) => {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'professor':
      return '/professor'
    case 'aluno':
    default:
      return '/painel'
  }
}

const normalizeRole = (email: string | undefined | null, hubRole: Role | string | null | undefined): Role => {
  if (email && email.toLowerCase() === MASTER_ADMIN_EMAIL) {
    return 'admin'
  }

  if (hubRole === 'admin' || hubRole === 'professor' || hubRole === 'aluno') {
    return hubRole
  }

  return 'aluno'
}

export function AuthProvider({ children }: PropsWithChildren) {
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapProfile = useCallback(
    (authUser: SupabaseUser, profileData?: Partial<UserProfile> | null): UserProfile => {
      const role = normalizeRole(authUser.email, profileData?.hub_role)
      return {
        id: authUser.id,
        email: authUser.email ?? '',
        first_name: profileData?.first_name ?? authUser.user_metadata?.first_name ?? null,
        last_name: profileData?.last_name ?? authUser.user_metadata?.last_name ?? null,
        phone: profileData?.phone ?? authUser.user_metadata?.phone ?? null,
        whatsapp: profileData?.whatsapp ?? authUser.user_metadata?.whatsapp ?? null,
        hub_role: role,
      }
    },
    [],
  )

  const fetchProfile = useCallback(
    async (authUser: SupabaseUser | null) => {
      if (!supabase || !authUser) {
        setUser(null)
        return null
      }

      const { data, error: profileError } = await supabase
        .from('users')
        .select('id,email,first_name,last_name,phone,whatsapp,hub_role')
        .eq('id', authUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      const profile = mapProfile(authUser, data ?? undefined)
      setUser(profile)
      return profile
    },
    [mapProfile, supabase],
  )

  useEffect(() => {
    if (!supabase) {
      setError('Supabase não configurado. Verifique as variáveis de ambiente.')
      setLoading(false)
      return
    }

    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      fetchProfile(data.session?.user ?? null)
        .catch((authError) => setError(authError.message))
        .finally(() => setLoading(false))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user ?? null).catch((authError) => setError(authError.message))
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [fetchProfile, supabase])

  const login = useCallback<AuthContextValue['login']>(
    async (email, password) => {
      if (!supabase) {
        const message = 'Supabase não configurado.'
        setError(message)
        return { success: false, error: message }
      }

      setLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError || !data.user) {
        const message = signInError?.message ?? 'Credenciais inválidas'
        setError(message)
        setLoading(false)
        return { success: false, error: message }
      }

      try {
        const profile = await fetchProfile(data.user)
        setLoading(false)
        return { success: true, profile: profile ?? mapProfile(data.user) }
      } catch (profileError) {
        const message = profileError instanceof Error ? profileError.message : 'Erro ao carregar perfil'
        setError(message)
        setLoading(false)
        return { success: false, error: message }
      }
    },
    [fetchProfile, mapProfile, supabase],
  )

  const logout = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase.auth.getUser()
    await fetchProfile(data.user ?? null)
  }, [fetchProfile, supabase])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    login,
    logout,
    refreshProfile,
    destinationForRole,
  }), [user, loading, error, login, logout, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider')
  }
  return ctx
}
