import { Link, NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

type NavItem = {
  label: string
  path: string
  end?: boolean
}

const navMap: Record<'student' | 'professor' | 'admin', NavItem[]> = {
  student: [{ label: 'Resumo', path: '/painel' }],
  professor: [{ label: 'Estúdios', path: '/professor' }],
  admin: [
    { label: 'Visão geral', path: '/admin', end: true },
    { label: 'Alunos', path: '/admin/alunos' },
    { label: 'Professores', path: '/admin/professores' },
    { label: 'Studios', path: '/admin/studios' },
    { label: 'Financeiro', path: '/admin/financeiro' },
    { label: 'Cupons', path: '/admin/cupons' },
    { label: 'Comunicação', path: '/admin/comunicacao' },
    { label: 'Certificados', path: '/admin/certificados' },
  ],
}

type DashboardLayoutProps = {
  variant: keyof typeof navMap
}

export default function DashboardLayout({ variant }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth()
  const navItems = navMap[variant]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm uppercase tracking-[0.4rem] text-white/50">carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--hub-gradient)] text-white">
      <header className="border-b border-white/5 bg-black/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-lg tracking-[0.4rem]">
            <span className="text-hub-gold">THE</span> HUB
          </Link>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span className="font-semibold tracking-[0.2rem] text-white/80">
              {user ? `${user.first_name ?? user.email} (${user.hub_role})` : 'Visitante'}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.3rem] text-white/70 transition hover:border-hub-gold/60 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <nav className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.25rem] text-white/70">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `rounded-full border px-4 py-2 transition ${
                  isActive
                    ? 'border-hub-gold/70 bg-white text-slate-900 shadow-lg shadow-black/20'
                    : 'border-white/10 text-white/60 hover:border-white/30'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {variant === 'admin' && (
            <Link to="/matricula" className="ml-auto">
              <Button variant="outline">abrir nova turma</Button>
            </Link>
          )}
        </nav>

        <section className="rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-2xl shadow-black/60 backdrop-blur-lg">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
