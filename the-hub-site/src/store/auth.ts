import { create } from 'zustand'
import type { AuthUser, Role } from '../types'
import { wait, safeUuid } from '../lib/supabaseClient'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchRole: (role: Role) => void
}

const mockUsers: Record<string, AuthUser> = {
  'aluno@thehub.com': {
    id: safeUuid(),
    name: 'Isabela Costa',
    email: 'aluno@thehub.com',
    role: 'student',
  },
  'admin@thehub.com': {
    id: safeUuid(),
    name: 'Equipe THE HUB',
    email: 'admin@thehub.com',
    role: 'admin',
  },
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  login: async (email: string) => {
    set({ loading: true, error: null })
    await wait()

    const normalizedEmail = email.toLowerCase()
    const sessionUser = mockUsers[normalizedEmail]

    if (!sessionUser) {
      set({ error: 'Usuário não encontrado', loading: false })
      return
    }

    set({ user: sessionUser, loading: false })
  },
  logout: () => set({ user: null }),
  switchRole: (role) =>
    set((state) => (state.user ? { user: { ...state.user, role } } : state)),
}))
