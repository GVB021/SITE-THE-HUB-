import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useHashScroll } from '../hooks/useHashScroll'

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'O que é', href: '/#sobre' },
  { label: 'Professores', href: '/#professores' },
  { label: 'FAQ', href: '/#faq' },
]

export default function MainLayout() {
  const { user, destinationForRole } = useAuth()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  useHashScroll()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const LogoIcon = () => (
    <svg width="22" height="32" viewBox="0 0 22 32" fill="none" aria-hidden="true">
      <rect x="8" width="6" height="22" rx="1" fill="#C9A84C" />
      <rect x="4" y="4" width="14" height="2" fill="#C9A84C" />
      <rect x="0.5" y="27" width="21" height="3" rx="1.5" fill="#C9A84C" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 border-b border-white/5 transition-all duration-300',
          scrolled || isHomePage ? 'bg-[#0A0A0A]/95 backdrop-blur-lg shadow-[0_8px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-2">
          <Link to="/" className="flex items-center gap-3 text-lg font-display tracking-[0.4rem] text-[#C9A84C]">
            <LogoIcon />
            <span>THE HUB</span>
          </Link>

          <nav className="hidden gap-6 text-xs uppercase tracking-[0.3rem] text-white/70 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `transition hover:text-[#C9A84C] ${isActive ? 'text-[#C9A84C]' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to={destinationForRole(user.hub_role)}>
                <Button variant="ghost" className="hidden md:inline-flex">
                  Ir para painel
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="hidden md:inline-flex">
                  Entrar
                </Button>
              </Link>
            )}
            <Link to="/matricula">
              <Button>Quero me matricular</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className={clsx('relative', isHomePage ? 'pt-0' : 'pt-20 md:pt-24')}>
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-[#050505]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-white/50">
          <div className="flex items-center gap-2 font-display text-[#C9A84C]">
            <LogoIcon /> THE HUB
          </div>
          <p>Rua das Artes, 180 • São Paulo, SP</p>
          <p>contato@thehub.com • +55 11 4002-8922</p>
        </div>
      </footer>
    </div>
  )
}
