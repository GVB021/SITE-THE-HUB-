import { Calendar, Clock4, GraduationCap } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { studentProfile } from '../../data/mocks'

export default function StudentDashboard() {
  const payments = studentProfile.payments

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Turma</p>
          <h3 className="font-display text-2xl text-white">{studentProfile.cohort.name}</h3>
          <p className="text-sm text-white/60">{studentProfile.cohort.schedule}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Professor</p>
          <div className="flex items-center gap-3">
            <img
              src={studentProfile.professor.avatar}
              alt={studentProfile.professor.name}
              className="h-12 w-12 rounded-2xl object-cover"
            />
            <div>
              <p className="font-display text-xl">{studentProfile.professor.name}</p>
              <p className="text-xs uppercase tracking-[0.2rem] text-white/50">mentor</p>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Status</p>
            <Badge variant="success" className="mt-3 w-fit">
              {studentProfile.status}
            </Badge>
          </div>
          <Button variant="outline">Ver contrato</Button>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center gap-3 text-white/70">
            <Calendar className="h-5 w-5 text-hub-gold" />
            <p className="text-sm uppercase tracking-[0.3rem]">Próxima aula</p>
          </div>
          <p className="font-display text-3xl text-white">{studentProfile.nextClass}</p>
          <p className="text-sm text-white/60">
            Envie seu aquecimento e teste vocal até 3h antes para feedback personalizado.
          </p>
          <Button variant="ghost" className="w-full">
            Entrar no estúdio virtual
          </Button>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-3 text-white/70">
            <GraduationCap className="h-5 w-5 text-hub-gold" />
            <p className="text-sm uppercase tracking-[0.3rem]">Plano de estudo</p>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li>• Treino de sinc com cenas dramáticas</li>
            <li>• Exercícios de respiração avançada</li>
            <li>• Estudo de personagens cinematográficos</li>
          </ul>
        </Card>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/30">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-white/50">pagamentos</p>
            <h3 className="font-display text-2xl text-white">Histórico</h3>
          </div>
          <Clock4 className="h-5 w-5 text-hub-gold" />
        </div>
        <div className="divide-y divide-white/5">
          {payments.map((payment) => (
            <div
              key={payment.month}
              className="flex items-center justify-between px-6 py-4 text-sm"
            >
              <span className="text-white/80">{payment.month}</span>
              <div className="flex items-center gap-4">
                <Badge variant={payment.status === 'Pago' ? 'success' : 'warning'}>
                  {payment.status}
                </Badge>
                <span className="font-semibold text-white">R$ {payment.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
