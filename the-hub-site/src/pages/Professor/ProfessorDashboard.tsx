import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CalendarDays, ClipboardList, Loader2, Users, Music4, MessageSquare, CheckCircle2, FileUp, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getSupabaseClient } from '../../lib/supabaseClient'
import { FileUpload } from '../../components/FileUpload'
import { MaterialsList } from '../../components/MaterialsList'
import { AttendancePDFGenerator } from '../../components/AttendancePDFGenerator'
import { MaterialFile } from '../../services/storageService'

type StudioRow = {
  id: string
  name: string | null
  modalidade: string | null
  dia_semana: string | null
  horario_inicio: string | null
  horario_fim: string | null
  vagas_total: number | null
  vagas_ocupadas: number | null
}

type SessionRow = {
  id: string
  data_sessao: string
  horario_inicio: string | null
  horario_fim: string | null
  studios?: { name?: string | null } | { name?: string | null }[] | null
}

type MembershipRow = {
  id: string
  status: string | null
  users?: { first_name?: string | null; last_name?: string | null } | { first_name?: string | null; last_name?: string | null }[] | null
  studios?: { id?: string | null; name?: string | null } | { id?: string | null; name?: string | null }[] | null
}

const formatSessionLabel = (session: SessionRow) => {
  const studio = Array.isArray(session.studios) ? session.studios[0] : session.studios
  const dayLabel = new Date(session.data_sessao).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  })
  return {
    studioName: studio?.name ?? 'Estúdio',
    label: `${dayLabel} • ${session.horario_inicio ?? '00:00'}`,
  }
}

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const [studios, setStudios] = useState<StudioRow[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [memberships, setMemberships] = useState<MembershipRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [selectedStudioId, setSelectedStudioId] = useState<string | null>(null)

  const loadDashboard = async () => {
    if (!supabase || !user) return
    setLoading(true)
    setError(null)
    try {
      const [studiosRes, sessionsRes, membershipsRes] = await Promise.all([
        supabase
          .from('studios')
          .select('id, name, modalidade, dia_semana, horario_inicio, horario_fim, vagas_total, vagas_ocupadas')
          .eq('professor_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('recording_sessions')
          .select('id, data_sessao, horario_inicio, horario_fim, status, studios:studio_id ( name )')
          .eq('professor_id', user.id)
          .order('data_sessao', { ascending: true }),
        supabase
          .from('studio_memberships')
          .select(
            'id, status, users:studio_memberships_user_id_fkey ( first_name, last_name, email ), studios:studio_memberships_studio_id_fkey ( id, name, professor_id )',
          )
          .eq('studios.professor_id', user.id),
      ])

      if (studiosRes.error) throw studiosRes.error
      if (sessionsRes.error) throw sessionsRes.error
      if (membershipsRes.error) throw membershipsRes.error

      setStudios((studiosRes.data ?? []) as StudioRow[])
      setSessions((sessionsRes.data ?? []) as any[])
      setMemberships((membershipsRes.data ?? []) as MembershipRow[])
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : 'Erro ao carregar painel do professor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [supabase, user])

  const handleAttendance = async (sessionId: string) => {
    if (!supabase) return
    setActionLoading(sessionId)
    try {
      const { error: updateError } = await supabase
        .from('recording_sessions')
        .update({ status: 'realizada' })
        .eq('id', sessionId)

      if (updateError) throw updateError
      await loadDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar presença')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendMaterial = async (sessionId: string) => {
    // Get the studio ID for this session
    const session = sessions.find(s => s.id === sessionId)
    if (session && studios.length > 0) {
      // For now, use the first studio. In a real app, you'd get the studio_id from the session
      setSelectedStudioId(studios[0].id)
      setShowMaterialModal(true)
    }
  }

  const handleUploadComplete = (_file: MaterialFile) => {
    setShowMaterialModal(false)
    // Show success message
    alert('Material uploaded successfully!')
  }

  const handleUploadError = (error: string) => {
    alert(`Upload failed: ${error}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/60">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" /> preparando seus estúdios...
      </div>
    )
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">{error}</div>
  }

  const totalAlunos = memberships.length
  const ativos = memberships.filter((membership) => membership.status === 'ativo').length
  const pendentes = memberships.filter((membership) => membership.status !== 'ativo').length
  const proximasSessoes = sessions.slice(0, 4)

  const alunosList = memberships.slice(0, 6).map((membership) => {
    const userInfo = Array.isArray(membership.users) ? membership.users[0] : membership.users
    const studioInfo = Array.isArray(membership.studios) ? membership.studios[0] : membership.studios
    return {
      id: membership.id,
      nome: `${userInfo?.first_name ?? ''} ${userInfo?.last_name ?? ''}`.trim() || 'Aluno',
      turma: studioInfo?.name ?? 'Turma não informada',
      status: membership.status ?? 'pendente',
    }
  })

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2 border-white/15 bg-black/30">
          <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Suas turmas</p>
          <h3 className="font-display text-3xl text-white">{studios.length} estúdios ativos</h3>
          <p className="text-sm text-white/60">Atualize presenças e feedbacks</p>
        </Card>
        <Card className="space-y-2 border-white/15 bg-black/30">
          <div className="flex items-center gap-3 text-white/70">
            <CalendarDays className="h-5 w-5 text-hub-gold" />
            <p className="text-xs uppercase tracking-[0.3rem]">Próxima sessão</p>
          </div>
          <h3 className="font-display text-2xl text-white">
            {proximasSessoes[0] ? formatSessionLabel(proximasSessoes[0]).label : 'Sem sessões agendadas'}
          </h3>
          <p className="text-sm text-white/60">
            {proximasSessoes[0] ? formatSessionLabel(proximasSessoes[0]).studioName : 'Inclua uma sessão para liberar agenda'}
          </p>
        </Card>
        <Card className="space-y-3 border-white/15 bg-black/30">
          <div className="flex items-center gap-3 text-white/70">
            <Users className="h-5 w-5 text-hub-gold" />
            <p className="text-xs uppercase tracking-[0.3rem]">alunos ativos</p>
          </div>
          <p className="text-4xl font-semibold text-white">{ativos}</p>
          <Badge variant={pendentes > 0 ? 'warning' : 'success'}>
            {pendentes > 0 ? `${pendentes} pendentes • revise` : 'Tudo em dia'}
          </Badge>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">agenda</p>
              <h3 className="font-display text-2xl text-white">Próximas sessões</h3>
            </div>
            <Button variant="ghost" className="text-white/70">
              Ver calendário completo
            </Button>
          </div>
          <div className="space-y-3">
            {proximasSessoes.length === 0 && <p className="text-sm text-white/50">Nenhuma sessão futura encontrada.</p>}
            {proximasSessoes.map((session: any) => {
              const sessionInfo = formatSessionLabel(session)
              return (
                <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{sessionInfo.studioName}</p>
                      <p className="text-xs uppercase tracking-[0.2rem] text-white/50">{sessionInfo.label}</p>
                    </div>
                    <Badge variant={session.status === 'realizada' ? 'success' : 'neutral'} className="bg-white/10 text-white">
                      {session.status === 'realizada' ? 'Realizada' : session.horario_fim}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="text-xs h-8 border-white/10 text-white/70 hover:text-white"
                      disabled={session.status === 'realizada' || actionLoading === session.id}
                      onClick={() => handleAttendance(session.id)}
                    >
                      {actionLoading === session.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                      Presença
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs h-8 border-white/10 text-white/70 hover:text-white"
                      onClick={() => handleSendMaterial(session.id)}
                    >
                      <FileUp className="mr-1 h-3 w-3" /> Material
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center gap-3 text-white/70">
            <ClipboardList className="h-5 w-5 text-hub-gold" />
            <p className="text-xs uppercase tracking-[0.3rem]">pendências</p>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li>• {pendentes} alunos aguardando feedback ou confirmação</li>
            <li>• {studios.filter((studio) => (studio.vagas_total ?? 0) - (studio.vagas_ocupadas ?? 0) > 0).length} turmas com vagas abertas</li>
            <li>• {sessions.length} sessões futuras registradas</li>
          </ul>
        </Card>

        {studios.length > 0 && (
          <AttendancePDFGenerator 
            studioId={studios[0].id} 
            professorId={user?.id || ''} 
          />
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Studios</p>
              <h3 className="font-display text-2xl text-white">Visão geral</h3>
            </div>
            <Music4 className="h-5 w-5 text-hub-gold" />
          </div>
          <div className="space-y-3">
            {studios.length === 0 && <p className="text-sm text-white/50">Você ainda não possui estúdios registrados.</p>}
            {studios.map((studio) => (
              <div key={studio.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{studio.name}</p>
                    <p className="text-xs text-white/50">
                      {studio.modalidade} • {studio.dia_semana} • {studio.horario_inicio} - {studio.horario_fim}
                    </p>
                  </div>
                  <Badge variant="warning">
                    {studio.vagas_ocupadas ?? 0}/{studio.vagas_total ?? 0}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 border-white/15 bg-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/50">Alunos</p>
              <h3 className="font-display text-2xl text-white">em acompanhamento ({totalAlunos})</h3>
            </div>
            <MessageSquare className="h-5 w-5 text-hub-gold" />
          </div>
          <div className="divide-y divide-white/5 text-sm text-white/80">
            {alunosList.length === 0 && <p className="py-6 text-center text-white/40">Nenhum aluno vinculado às suas turmas.</p>}
            {alunosList.map((aluno) => (
              <div key={aluno.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-white">{aluno.nome}</p>
                  <p className="text-xs text-white/50">{aluno.turma}</p>
                </div>
                <Badge variant={aluno.status === 'ativo' ? 'success' : 'warning'}>{aluno.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Material Upload Modal */}
      {showMaterialModal && selectedStudioId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upload Materials</h2>
                <button
                  onClick={() => setShowMaterialModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Material</h3>
                <FileUpload
                  studioId={selectedStudioId}
                  professorId={user?.id || ''}
                  onUploadComplete={handleUploadComplete}
                  onError={handleUploadError}
                />
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Materials</h3>
                <MaterialsList
                  studioId={selectedStudioId}
                  canDelete={true}
                  onDelete={() => {
                    // Materials will refresh automatically
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
