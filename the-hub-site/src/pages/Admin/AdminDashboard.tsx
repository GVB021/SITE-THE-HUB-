import {
  BarChart3,
  DollarSign,
  MessageCircle,
  Share2,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { MetricCard } from '../../components/dashboard/MetricCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import {
  adminMetrics,
  commissions,
  coupons,
  messages,
  sellers,
  studentsList,
} from '../../data/mocks'

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Faturamento"
          value={formatBRL(adminMetrics.revenue)}
          delta="+12% vs mês anterior"
          icon={<DollarSign className="h-7 w-7" />}
        />
        <MetricCard
          label="Alunos ativos"
          value={adminMetrics.activeStudents}
          delta="5 vagas disponíveis"
          icon={<UsersRound className="h-7 w-7" />}
        />
        <MetricCard
          label="Turmas abertas"
          value={adminMetrics.openCohorts}
          delta="2 novas turmas em aprovação"
          icon={<Share2 className="h-7 w-7" />}
        />
        <MetricCard
          label="Conversão"
          value={`${adminMetrics.conversionRate}%`}
          delta="Meta: 40%"
          icon={<BarChart3 className="h-7 w-7" />}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">gestão</p>
              <h3 className="font-display text-2xl">Alunos e turmas</h3>
            </div>
            <Button variant="ghost">Exportar CSV</Button>
          </div>
          <div className="divide-y divide-white/5">
            {studentsList.map((student) => (
              <div
                key={student.id}
                className="flex flex-wrap items-center gap-3 px-2 py-3 text-sm text-white/80"
              >
                <div className="flex-1">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-white/50">{student.cohort}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span>{student.professor}</span>
                </div>
                <Badge
                  variant={
                    student.status === 'Ativa'
                      ? 'success'
                      : student.status === 'Em avaliação'
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {student.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-3 bg-gradient-to-br from-white/10 to-white/[0.02]">
            <div className="flex items-center justify-between text-white">
              <h3 className="font-display text-xl">Vendedores e cupons</h3>
              <Badge variant="neutral">tracking</Badge>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              {sellers.map((seller) => (
                <div key={seller.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{seller.name}</p>
                    <p className="text-xs text-white/50">
                      {seller.leads} leads • {seller.conversions} matrículas
                    </p>
                  </div>
                  <Badge variant="warning">
                    {Math.round((seller.conversions / Math.max(seller.leads, 1)) * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 bg-black/40">
            <div className="flex items-center justify-between text-white">
              <h3 className="font-display text-xl">Mensagens</h3>
              <MessageCircle className="h-5 w-5 text-hub-gold" />
            </div>
            <div className="space-y-2 text-sm text-white/70">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between gap-4 text-xs text-white/40">
                    <span>{message.timestamp}</span>
                    <Badge variant={message.status === 'Novo' ? 'warning' : 'neutral'}>
                      {message.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-white">{message.subject}</p>
                  <p className="text-xs text-white/50">
                    {message.sender} • {message.channel}
                  </p>
                </div>
              ))}
            </div>
            <Button fullWidth>Enviar broadcast</Button>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-3 bg-black/30">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/40">comissões</p>
              <h3 className="font-display text-2xl">Afiliados e cupons</h3>
            </div>
            <Wallet className="h-5 w-5 text-hub-gold" />
          </div>
          <div className="divide-y divide-white/5 text-sm text-white/80">
            {commissions.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{item.seller}</p>
                  <p className="text-xs text-white/50">Aluno: {item.student}</p>
                </div>
                <div className="text-right">
                  <p>{formatBRL(item.commission)}</p>
                  <Badge variant={item.status === 'Pago' ? 'success' : 'warning'}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 bg-gradient-to-br from-hub-gold/15 via-hub-gold/5 to-transparent">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-white/60">cupons ativos</p>
            <h3 className="font-display text-2xl text-white">Origem das matrículas</h3>
          </div>
          <div className="space-y-3 text-sm text-white">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="font-semibold">{coupon.code}</span>
                <span className="text-white/70">
                  {coupon.conversions} matrículas • {coupon.owner}
                </span>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full">
            Gerar novo cupom
          </Button>
        </Card>
      </section>
    </div>
  )
}
