import { Link, NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/ui/Button'

const studentNav = [
  { label: 'Resumo', path: '/student' },
]

const adminNav = [
  { label: 'Dashboard', path: '/admin' },
]

type DashboardLayoutProps = {
  variant: 'student' | 'admin'
}

export default function DashboardLayout({ variant }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore()
  const navItems = variant === 'admin' ? adminNav : studentNav

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-hub-charcoal to-black text-white">
      <header className="border-b border-white/5 bg-black/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-lg tracking-[0.4rem]">
            <span className="text-hub-gold">THE</span> HUB
          </Link>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span>{user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2rem] text-white/70 transition hover:border-hub-gold/60 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <nav className="flex flex-wrap gap-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-full border px-4 py-2 uppercase tracking-[0.2rem] transition ${
                  isActive
                    ? 'border-hub-gold/70 bg-hub-gold/10 text-white'
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

        <section className="rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-2xl shadow-black/50">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
