import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await login(email, password)
    const role = email.toLowerCase() === 'admin@thehub.com' ? 'admin' : 'student'
    if (!error) {
      navigate((location.state as { from?: Location })?.from?.pathname ?? `/${role}`)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-6 py-20">
      <Card className="w-full space-y-6 bg-black/40 p-10">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs uppercase tracking-[0.4rem] text-hub-gold">Área logada</p>
          <h1 className="font-display text-4xl text-white">Acesse o THE HUB</h1>
          <p className="text-sm text-white/60">
            Use os acessos enviados pelo time. Para testes: <strong>aluno@thehub.com</strong> ou
            <strong> admin@thehub.com</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <Mail className="h-4 w-4" /> E-mail
            </label>
            <Input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@thehub.com"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <Lock className="h-4 w-4" /> Senha
            </label>
            <Input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
            />
            <p className="text-xs text-white/40">
              Simulação: qualquer senha funciona. Autenticação real via Supabase pronta para plug-in.
            </p>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
