import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { AlertTriangle, DollarSign, Share2, UsersRound } from 'lucide-react'
import { MetricCard } from '../../components/dashboard/MetricCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { getSupabaseClient } from '../../lib/supabaseClient'

type MetricState = {
  revenueMonth: number
  activeStudents: number
  openStudios: number
  todaysEnrollments: number
}

type EnrollmentRow = {
  id: string
  created_at: string
  status: string
  studentName: string
  studioName: string
}

type StudioAlert = {
  id: string
  name: string
  vagas_ocupadas: number
  vagas_total: number
  dia_semana?: string | null
  horario_inicio?: string | null
  horario_fim?: string | null
}

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

const buildLastMonths = (count = 6) => {
  const now = new Date()
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: monthFormatter.format(date).toUpperCase(),
      date,
    }
  })
}

const quickLinks = [
  { label: 'Gerir alunos', to: '/admin/alunos', description: 'Status, matrículas e comunicação' },
  { label: 'Professores', to: '/admin/professores', description: 'Sessões e broadcasts' },
  { label: 'Studios', to: '/admin/studios', description: 'Vagas e turmas' },
  { label: 'Financeiro', to: '/admin/financeiro', description: 'Pagamentos e recebíveis' },
]

export default function AdminDashboard() {
  const supabase = getSupabaseClient()
  const [metrics, setMetrics] = useState<MetricState>({
    revenueMonth: 0,
    activeStudents: 0,
    openStudios: 0,
    todaysEnrollments: 0,
  })
  const [growthData, setGrowthData] = useState<{ month: string; alunos: number }[]>([])
  const [alerts, setAlerts] = useState<StudioAlert[]>([])
  const [latestEnrollments, setLatestEnrollments] = useState<EnrollmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const monthsReference = useMemo(() => buildLastMonths(6), [])

  useEffect(() => {
    if (!supabase) {
      setError('Supabase não configurado. Verifique o arquivo .env.')
      setLoading(false)
      return
    }

    const loadDashboard = async () => {
      setLoading(true)
      setError(null)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

      try {
        const [paymentsRes, activeStudentsRes, openStudiosRes, todaysEnrollmentsRes, membershipHistoryRes, alertsRes, latestEnrollmentsRes] =
          await Promise.all([
            supabase
              .from('hub_pagamentos')
              .select('valor, status, created_at')
              .eq('status', 'pago')
              .gte('created_at', startOfMonth.toISOString()),
            supabase
              .from('studio_memberships')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'ativo'),
            supabase
              .from('studios')
              .select('*', { count: 'exact', head: true })
              .eq('is_active', true),
            supabase
              .from('studio_memberships')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', startOfToday.toISOString()),
            supabase
              .from('studio_memberships')
              .select('id, created_at')
              .gte('created_at', sixMonthsAgo.toISOString()),
            supabase
              .from('studios')
              .select('id, name, vagas_ocupadas, vagas_total, dia_semana, horario_inicio, horario_fim')
              .eq('is_active', true)
              .eq('vagas_ocupadas', 3),
            supabase
              .from('studio_memberships')
              .select(
                'id, created_at, status, users:studio_memberships_user_id_fkey ( first_name, last_name ), studios:studio_memberships_studio_id_fkey ( name )',
              )
              .order('created_at', { ascending: false })
              .limit(5),
          ])

        const revenueMonth = paymentsRes.data?.reduce((sum, payment) => sum + (payment.valor ?? 0), 0) ?? 0
        const activeStudents = activeStudentsRes.count ?? 0
        const openStudios = openStudiosRes.count ?? 0
        const todaysEnrollments = todaysEnrollmentsRes.count ?? 0

        const growthMap = monthsReference.reduce<Record<string, number>>((acc, month) => {
          acc[month.key] = 0
          return acc
        }, {})

        membershipHistoryRes.data?.forEach((membership) => {
          if (!membership.created_at) return
          const createdDate = new Date(membership.created_at)
          const key = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}`
          if (key in growthMap) {
            growthMap[key] += 1
          }
        })

        const growthDataParsed = monthsReference.map((month) => ({
          month: month.label,
          alunos: growthMap[month.key] ?? 0,
        }))

        const alertsParsed = alertsRes.data?.map((studio) => ({
          id: studio.id,
          name: studio.name,
          vagas_ocupadas: studio.vagas_ocupadas,
          vagas_total: studio.vagas_total,
          dia_semana: studio.dia_semana,
          horario_inicio: studio.horario_inicio,
          horario_fim: studio.horario_fim,
        })) ?? []

        const enrollmentRows = latestEnrollmentsRes.data?.map((row: any) => {
          const userInfo = Array.isArray(row.users) ? row.users[0] : row.users
          const studioInfo = Array.isArray(row.studios) ? row.studios[0] : row.studios
          return {
            id: row.id,
            created_at: row.created_at,
            status: row.status,
            studentName: `${userInfo?.first_name ?? ''} ${userInfo?.last_name ?? ''}`.trim() || 'Aluno sem nome',
            studioName: studioInfo?.name ?? 'Studio sem nome',
          }
        }) ?? []

        setMetrics({ revenueMonth, activeStudents, openStudios, todaysEnrollments })
        setGrowthData(growthDataParsed)
        setAlerts(alertsParsed)
        setLatestEnrollments(enrollmentRows)
      } catch (dashboardError) {
        setError(dashboardError instanceof Error ? dashboardError.message : 'Erro ao carregar métricas')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [monthsReference, supabase])
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/70">
        <p className="text-sm uppercase tracking-[0.4rem]">carregando painel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-100">{error}</div>
      )}

      <Card className="space-y-4 border-white/15 bg-black/30">
        <div>
          <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Acesso rápido</p>
          <h3 className="font-display text-2xl text-white">Secretaria digital</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30">
              <p className="font-semibold text-white">{link.label}</p>
              <p className="text-sm text-white/60">{link.description}</p>
            </Link>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Faturamento do mês" value={formatBRL(metrics.revenueMonth)} icon={<DollarSign className="h-7 w-7" />} />
        <MetricCard label="Alunos ativos" value={metrics.activeStudents} icon={<UsersRound className="h-7 w-7" />} />
        <MetricCard label="Turmas abertas" value={metrics.openStudios} icon={<Share2 className="h-7 w-7" />} />
        <MetricCard label="Matrículas hoje" value={metrics.todaysEnrollments} icon={<AlertTriangle className="h-7 w-7" />} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">crescimento</p>
              <h3 className="font-display text-2xl">Novos alunos (6 meses)</h3>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={growthData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="alunos" stroke="#C9A84C" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">alertas</p>
              <h3 className="font-display text-2xl">Turmas quase completas</h3>
            </div>
            <Badge variant="warning">Falta 1</Badge>
          </div>
          <div className="space-y-3 text-sm text-white/80">
            {alerts.length === 0 && <p className="text-white/50">Nenhuma turma com 3 vagas ocupadas.</p>}
            {alerts.map((studio) => (
              <div key={studio.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{studio.name}</p>
                    <p className="text-xs text-white/50">
                      {studio.dia_semana} • {studio.horario_inicio} - {studio.horario_fim}
                    </p>
                  </div>
                  <Badge variant="warning">
                    {studio.vagas_ocupadas}/{studio.vagas_total}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-white/60">Falta apenas 1 matrícula para abrir a turma. Considere priorizar esta oferta.</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="space-y-4 border-white/15 bg-black/30">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-white/50">novas matrículas</p>
            <h3 className="font-display text-2xl">Últimos cadastros</h3>
          </div>
          <Button variant="ghost">Exportar CSV</Button>
        </div>
        <div className="divide-y divide-white/5 text-sm text-white/80">
          {latestEnrollments.length === 0 && <p className="py-6 text-center text-white/40">Nenhuma matrícula registrada ainda.</p>}
          {latestEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="flex flex-wrap items-center gap-4 px-2 py-3">
              <div className="flex-1">
                <p className="font-semibold text-white">{enrollment.studentName}</p>
                <p className="text-xs text-white/50">{enrollment.studioName}</p>
              </div>
              <Badge variant={enrollment.status === 'ativo' ? 'success' : 'neutral'}>{enrollment.status}</Badge>
              <span className="text-xs text-white/50">
                {new Date(enrollment.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
