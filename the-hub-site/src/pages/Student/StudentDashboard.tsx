import { useEffect, useMemo, useState } from 'react'
import { Clock4, GraduationCap, Award, CheckCircle2, FileText, MessageCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { getSupabaseClient } from '../../lib/supabaseClient'
import { MaterialsList } from '../../components/MaterialsList'
import { NotificationSettings } from '../../components/NotificationSettings'

type ProgressMilestone = {
  id: string
  title: string
  date: string
  completed: boolean
}

type Material = {
  id: string
  title: string
  type: 'video' | 'pdf' | 'audio'
  link: string
}

type EnrollmentInfo = {
  studioName: string
  professorName: string
  horario: string
  status: string
  inicio: string
}

type StudioRelation = {
  name?: string | null
  dia_semana?: string | null
  horario_inicio?: string | null
  horario_fim?: string | null
  modalidade?: string | null
  professores?: { nome?: string | null }[] | { nome?: string | null } | null
}

type MembershipRow = {
  status: string
  created_at: string
  studios?: StudioRelation | StudioRelation[] | null
}

type PaymentInfo = {
  id: string
  mes_referencia: string | null
  valor: number | null
  status: string | null
}

type CertificateInfo = {
  id: string
  aluno_id: string
  link_certificado: string | null
  emitido_em: string
}

type RecordingSessionRow = {
  data_sessao: string
  horario_inicio: string
  horario_fim: string
  studios?: { name?: string | null } | { name?: string | null }[] | null
  professores?: { nome?: string | null } | { nome?: string | null }[] | null
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const [enrollment, setEnrollment] = useState<EnrollmentInfo | null>(null)
  const [payments, setPayments] = useState<PaymentInfo[]>([])
  const [certificates, setCertificates] = useState<CertificateInfo[]>([])
  const [nextSession, setNextSession] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [milestones] = useState<ProgressMilestone[]>([
    { id: '1', title: 'Introdução à Dublagem', date: '2024-01-15', completed: true },
    { id: '2', title: 'Técnicas de Respiração', date: '2024-02-10', completed: true },
    { id: '3', title: 'Sincronia Labial', date: '2024-03-05', completed: false },
    { id: '4', title: 'Interpretação de Personagem', date: '2024-04-01', completed: false },
  ])
  const [materials] = useState<Material[]>([
    { id: '1', title: 'Guia de Aquecimento Vocal', type: 'pdf', link: '#' },
    { id: '2', title: 'Vídeo: Sincronia na Prática', type: 'video', link: '#' },
    { id: '3', title: 'Áudio: Treino de Dicção', type: 'audio', link: '#' },
  ])

  const formatBRL = (value?: number | null) =>
    (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  useEffect(() => {
    if (!supabase || !user) {
      setLoading(false)
      return
    }

    const loadDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const [{ data: membershipData }, { data: paymentsData }, { data: certificatesData }, { data: nextSessionData }] = await Promise.all([
          supabase
            .from('studio_memberships')
            .select(
              'status, created_at, studios:studio_id ( name, dia_semana, horario_inicio, horario_fim, modalidade, professores:professor_id ( nome ) )',
            )
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('hub_pagamentos')
            .select('id, mes_referencia, valor, status')
            .eq('user_id', user.id)
            .order('mes_referencia', { ascending: false }),
          supabase
            .from('hub_certificados')
            .select('id, aluno_id, link_certificado, emitido_em')
            .eq('aluno_id', user.id)
            .order('emitido_em', { ascending: false }),
          supabase
            .from('recording_sessions')
            .select('data_sessao, horario_inicio, horario_fim, studios:studio_id(name), professores:professor_id(nome)')
            .gte('data_sessao', new Date().toISOString())
            .order('data_sessao', { ascending: true })
            .limit(1),
        ])

        if (membershipData && membershipData.length > 0) {
          const membership = membershipData[0] as MembershipRow
          const studio = Array.isArray(membership.studios) ? membership.studios[0] : membership.studios
          const professorRelation = Array.isArray(studio?.professores)
            ? studio?.professores?.[0]
            : (studio?.professores as { nome?: string } | null)

          setEnrollment({
            studioName: studio?.name ?? 'Turma não identificada',
            professorName: professorRelation?.nome ?? 'A definir',
            horario: `${studio?.dia_semana ?? ''} • ${studio?.horario_inicio ?? ''} - ${studio?.horario_fim ?? ''}`,
            status: membership.status,
            inicio: membership.created_at,
          })
        }

        setPayments(paymentsData ?? [])
        setCertificates(certificatesData ?? [])

        if (nextSessionData && nextSessionData.length > 0) {
          const session = nextSessionData[0] as RecordingSessionRow
          const studioInfo = Array.isArray(session.studios) ? session.studios[0] : session.studios
          const dateLabel = new Date(session.data_sessao).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
          })
          setNextSession(`${dateLabel} • ${session.horario_inicio} (${studioInfo?.name ?? 'Estúdio'})`)
        } else {
          setNextSession(null)
        }
      } catch (dashboardError) {
        setError(dashboardError instanceof Error ? dashboardError.message : 'Erro ao carregar painel do aluno')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [supabase, user])

  const membershipStatusVariant = useMemo(() => {
    if (!enrollment) return 'neutral'
    if (enrollment.status === 'ativo') return 'success'
    if (enrollment.status === 'inadimplente') return 'warning'
    return 'neutral'
  }, [enrollment])

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-white/50">
        <p className="text-xs uppercase tracking-[0.4rem]">carregando painel...</p>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">{error}</div>
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="relative overflow-hidden border-white/20 bg-gradient-to-br from-white/5 via-transparent to-white/5 p-8">
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4rem] text-white/60">sua jornada</p>
            <h3 className="font-display text-3xl text-white">
              {enrollment?.studioName ?? 'Sem turma'}
            </h3>
            <p className="text-sm text-white/70">{enrollment?.horario ?? 'Contate o suporte para detalhes de matrícula'}</p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.25rem]">
                mentor • {enrollment?.professorName ?? 'A definir'}
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.25rem]">
                início •
                {enrollment?.inicio
                  ? ` ${new Date(enrollment.inicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
                  : ' em breve'}
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -right-14 -top-12 h-48 w-48 rounded-full bg-hub-gold/30 blur-[80px]" />
            <div className="absolute bottom-0 left-6 h-32 w-32 rounded-full bg-hub-blue/30 blur-[70px]" />
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Professor</p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&h=200&fit=crop"
                alt={enrollment?.professorName ?? 'Professor'}
                className="h-12 w-12 rounded-2xl object-cover"
              />
              <div>
                <p className="font-display text-xl">{enrollment?.professorName ?? 'Professor não atribuído'}</p>
                <p className="text-xs uppercase tracking-[0.2rem] text-white/50">mentor</p>
              </div>
            </div>
          </Card>
          <Card className="flex flex-col justify-between rounded-[28px] border-white/15 bg-black/20">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Status</p>
              <Badge variant={membershipStatusVariant} className="mt-3 w-fit">
                {enrollment?.status ?? 'Sem matrícula'}
              </Badge>
            </div>
            <Button variant="outline" className="border-white/30 text-white/90">
              Ver contrato
            </Button>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center gap-3 text-white/70">
            <Calendar className="h-5 w-5 text-hub-gold" />
            <p className="text-sm uppercase tracking-[0.3rem]">Próxima sessão</p>
          </div>
          <p className="font-display text-3xl text-white">{nextSession ?? 'Nenhuma sessão agendada'}</p>
          <p className="text-sm text-white/60">Você receberá um lembrete automático por WhatsApp antes da aula.</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 border border-white/10" aria-label="Entrar no estúdio virtual">
              Entrar no estúdio virtual
            </Button>
            <Button
              variant="outline"
              className="border-white/10 text-white/70"
              onClick={() => window.open(`https://wa.me/5511999999999?text=Olá, gostaria de reagendar minha aula no estúdio ${enrollment?.studioName}`, '_blank')}
            >
              Reagendar
            </Button>
          </div>
        </Card>

        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center gap-3 text-white/70">
            <GraduationCap className="h-5 w-5 text-hub-gold" />
            <p className="text-sm uppercase tracking-[0.3rem]">Seu progresso</p>
          </div>
          <div className="space-y-4">
            {milestones.map((ms, idx) => (
              <div key={ms.id} className="relative flex gap-4">
                {idx !== milestones.length - 1 && (
                  <div className="absolute left-[11px] top-7 h-full w-[2px] bg-white/10" />
                )}
                <div className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${ms.completed ? 'border-hub-gold bg-hub-gold' : 'border-white/20 bg-black'}`}>
                  {ms.completed && <CheckCircle2 className="h-4 w-4 text-slate-900" />}
                </div>
                <div className="space-y-1 pb-4">
                  <p className={`text-sm font-semibold ${ms.completed ? 'text-white' : 'text-white/40'}`}>{ms.title}</p>
                  <p className="text-xs text-white/30">{new Date(ms.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70">
              <FileText className="h-5 w-5 text-hub-gold" />
              <p className="text-sm uppercase tracking-[0.3rem]">Materiais de Apoio</p>
            </div>
          </div>
          <MaterialsList studentId={user?.id || ''} />
        </Card>

        <Card className="space-y-4 border-white/15 bg-black/30">
          <NotificationSettings userId={user?.id || ''} />
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-1">
        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center gap-3 text-white/70">
            <MessageCircle className="h-5 w-5 text-hub-gold" />
            <p className="text-sm uppercase tracking-[0.3rem]">Suporte Direto</p>
          </div>
          <p className="text-sm text-white/60">Precisa de ajuda com o conteúdo ou tem dúvidas financeiras?</p>
          <Button
            className="w-full bg-emerald-500 text-slate-900 hover:bg-emerald-400"
            onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Falar com Secretaria
          </Button>
        </Card>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-black/30">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-white/50">pagamentos</p>
            <h3 className="font-display text-2xl text-white">Histórico</h3>
          </div>
          <Clock4 className="h-5 w-5 text-hub-gold" />
        </div>
        <div className="divide-y divide-white/5">
          {payments.length === 0 && (
            <p className="py-6 text-center text-sm text-white/40">Nenhum pagamento registrado ainda.</p>
          )}
          {payments.map((payment) => (
            <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
              <span className="text-white/80">{payment.mes_referencia ?? 'Mês não informado'}</span>
              <div className="flex items-center gap-4">
                <Badge variant={payment.status === 'pago' ? 'success' : 'warning'}>
                  {payment.status ?? 'pendente'}
                </Badge>
                <span className="font-semibold text-white">{formatBRL(payment.valor)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-black/30">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3 text-white/70">
            <Award className="h-5 w-5 text-hub-gold" />
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">certificados</p>
              <h3 className="font-display text-2xl text-white">Histórico de emissão</h3>
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/5 text-sm text-white/80">
          {certificates.length === 0 && <p className="py-6 text-center text-white/40">Ainda não há certificados emitidos.</p>}
          {certificates.map((certificate) => (
            <div key={certificate.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <p className="font-semibold">Emitido em</p>
                <p className="text-xs text-white/50">
                  {new Date(certificate.emitido_em).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {certificate.link_certificado ? (
                <a
                  href={certificate.link_certificado}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-hub-gold underline-offset-4 hover:underline"
                >
                  Download
                </a>
              ) : (
                <Badge variant="neutral">Disponível em breve</Badge>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
