import { useState } from 'react'
import { CheckCircle, CreditCard, MessageSquare } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { cohorts } from '../../data/mocks'

interface FormState {
  name: string
  email: string
  whatsapp: string
  cohortId: string
}

const initialState: FormState = {
  name: '',
  email: '',
  whatsapp: '',
  cohortId: cohorts[0]?.id ?? '',
}

export default function EnrollmentPage() {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle')

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('processing')
    setTimeout(() => {
      setStatus('success')
    }, 1200)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 md:flex-row">
      <form
        onSubmit={handleSubmit}
        className="flex-1 space-y-6 border border-white/15 bg-[#101010] p-8"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.4rem] text-[#C9A84C]">matrícula</p>
          <h1 className="font-display text-4xl text-white">
            Garanta sua vaga no THE HUB
          </h1>
          <p className="text-sm text-white/60">
            Preencha o formulário e finalize via Mercado Pago. Enviamos o contrato e
            acesso ao painel imediatamente.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            required
            name="name"
            placeholder="Nome completo"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            required
            type="email"
            name="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            required
            name="whatsapp"
            placeholder="WhatsApp com DDD"
            value={form.whatsapp}
            onChange={handleChange}
          />
          <select
            name="cohortId"
            value={form.cohortId}
            onChange={handleChange}
            className="w-full rounded-[4px] border border-white/15 bg-[#141414] px-4 py-3 text-sm text-white focus:border-[#C9A84C] focus:outline-none"
          >
            {cohorts.map((cohort) => (
              <option
                key={cohort.id}
                value={cohort.id}
                className="bg-[#0A0A0A] text-white"
              >
                {cohort.name} — {cohort.schedule} ({cohort.availableSpots} vagas)
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" fullWidth disabled={status === 'processing'}>
          {status === 'processing' ? 'Gerando pagamento...' : 'Pagamento via Mercado Pago'}
        </Button>
        {status === 'success' && (
          <p className="text-sm text-emerald-400">
            Pagamento gerado com sucesso! Enviamos o link para o seu WhatsApp e e-mail.
          </p>
        )}
      </form>

      <div className="flex w-full flex-1 flex-col gap-6">
        <Card className="space-y-4 bg-[#111111]">
          <div className="flex items-center gap-3 text-white/70">
            <CreditCard className="h-5 w-5 text-hub-gold" />
            <p className="text-sm uppercase tracking-[0.3rem]">Resumo</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/30 p-6">
            <div className="flex items-center justify-between text-white">
              <span className="text-lg">Plano Mensal THE HUB</span>
              <strong className="font-display text-3xl">R$ 300</strong>
            </div>
            <p className="text-sm text-white/60">Renovação mensal • Sem fidelidade</p>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li>• Contrato digital e onboarding imediato</li>
            <li>• Aulas gravadas disponíveis por 30 dias</li>
            <li>• Suporte via WhatsApp e Discord</li>
            <li>• Mentorias extras com diretores convidados</li>
          </ul>
        </Card>

        <Card className="space-y-4 bg-[#0F0F0F]">
          <div className="flex items-center gap-3 text-white/70">
            <MessageSquare className="h-5 w-5 text-hub-gold" />
            <p className="text-sm uppercase tracking-[0.3rem]">Dúvidas?</p>
          </div>
          <p className="text-sm text-white/70">
            Nossa equipe comercial responde em até 10 minutos no WhatsApp
            <strong className="text-white"> +55 11 4002-8922</strong>.
          </p>
        </Card>

        <Card className="flex items-center gap-4 border border-[#C9A84C]/40 bg-[#1A1A1A] text-[#F5F5F5]">
          <CheckCircle className="h-6 w-6" />
          <p className="text-sm">
            Sistema preparado para integrar com o checkout real do Mercado Pago. Basta preencher as chaves no futuro.
          </p>
        </Card>
      </div>
    </div>
  )
}
