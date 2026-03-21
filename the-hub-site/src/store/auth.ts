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
    first_name: 'Isabela',
    last_name: 'Costa',
    email: 'aluno@thehub.com',
    hub_role: 'aluno',
  },
  'admin@thehub.com': {
    id: safeUuid(),
    first_name: 'Equipe',
    last_name: 'THE HUB',
    email: 'admin@thehub.com',
    hub_role: 'admin',
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
