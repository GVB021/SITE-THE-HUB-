import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Mail, Users, MessageSquare, ChevronRight, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { getSupabaseClient } from '../../../lib/supabaseClient'

interface ProfessorRow {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  whatsapp: string | null
  created_at: string
}

interface StudioRow {
  id: string
  name: string | null
  professor_id: string | null
  modalidade: string | null
  vagas_total: number | null
  vagas_ocupadas: number | null
}

interface SessionRow {
  id: string
  professor_id: string | null
  data_sessao: string
}

const buildProfessorName = (professor: ProfessorRow) =>
  `${professor.first_name ?? ''} ${professor.last_name ?? ''}`.trim() || professor.email || 'Professor'

export function ProfessorsModule() {
  const supabase = getSupabaseClient()
  const [professors, setProfessors] = useState<ProfessorRow[]>([])
  const [studios, setStudios] = useState<StudioRow[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [broadcasting, setBroadcasting] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    try {
      const [professorsRes, studiosRes, sessionsRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, first_name, last_name, email, whatsapp, created_at')
          .eq('hub_role', 'professor')
          .order('created_at', { ascending: false }),
        supabase
          .from('studios')
          .select('id, name, professor_id, modalidade, vagas_total, vagas_ocupadas')
          .eq('is_active', true),
        supabase
          .from('recording_sessions')
          .select('id, professor_id, data_sessao')
          .gte('data_sessao', new Date().toISOString()),
      ])

      if (professorsRes.error) throw professorsRes.error
      if (studiosRes.error) throw studiosRes.error
      if (sessionsRes.error) throw sessionsRes.error

      setProfessors((professorsRes.data ?? []) as ProfessorRow[])
      setStudios((studiosRes.data ?? []) as StudioRow[])
      setSessions((sessionsRes.data ?? []) as SessionRow[])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Falha ao carregar professores')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const studioCountMap = useMemo(() => {
    return studios.reduce<Record<string, number>>((acc, studio) => {
      if (studio.professor_id) {
        acc[studio.professor_id] = (acc[studio.professor_id] ?? 0) + 1
      }
      return acc
    }, {})
  }, [studios])

  const sessionCountMap = useMemo(() => {
    return sessions.reduce<Record<string, number>>((acc, session) => {
      if (session.professor_id) {
        acc[session.professor_id] = (acc[session.professor_id] ?? 0) + 1
      }
      return acc
    }, {})
  }, [sessions])

  const filteredProfessors = useMemo(() => {
    if (!searchTerm) return professors
    return professors.filter((professor) =>
      buildProfessorName(professor).toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [professors, searchTerm])

  const handleSendBroadcast = async (professor: ProfessorRow) => {
    if (!supabase || !professor.email) return
    setBroadcasting(professor.id)
    const payload = {
      canal: 'email',
      assunto: 'Atualização de agenda',
      mensagem:
        'Atualize seus horários e confirme as próximas sessões diretamente no painel do professor.',
      destinatario_email: professor.email,
      status: 'enviado',
    }

    const { error: insertError } = await supabase.from('hub_comunicacoes').insert(payload)
    if (insertError) {
      setError(insertError.message)
    }
    setBroadcasting(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2rem] text-white/40">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Professores</span>
          </div>
          <h1 className="font-display text-3xl text-white">Gestão de Professores</h1>
        </div>
        <Button className="bg-hub-gold text-slate-900 hover:bg-hub-gold/90 rounded-2xl px-6">
          <UserPlus className="mr-2 h-4 w-4" /> Novo Professor
        </Button>
      </header>

      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-white/60">
          <Users className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.3rem]">Professores</span>
        </div>
        <input
          className="flex-1 min-w-[220px] rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40"
          placeholder="Buscar por nome ou email"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Button variant="ghost" onClick={fetchData} className="text-white/80">
          Atualizar lista
        </Button>
      </Card>

      <Card>
        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando professores...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.3rem] text-white/40">
                  <th className="px-4 py-3 font-normal">Professor</th>
                  <th className="px-4 py-3 font-normal">Turmas ativas</th>
                  <th className="px-4 py-3 font-normal">Sessões futuras</th>
                  <th className="px-4 py-3 font-normal">Contato</th>
                  <th className="px-4 py-3 font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProfessors.map((professor) => (
                  <tr key={professor.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{buildProfessorName(professor)}</p>
                      <p className="text-xs text-white/50">
                        Desde {new Date(professor.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-4">{studioCountMap[professor.id] ?? 0}</td>
                    <td className="px-4 py-4">{sessionCountMap[professor.id] ?? 0}</td>
                    <td className="px-4 py-4 space-y-1 text-sm text-white/70">
                      {professor.email && (
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-hub-gold" /> {professor.email}
                        </span>
                      )}
                      {professor.whatsapp && (
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-hub-gold" /> {professor.whatsapp}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          className="border-white/10 text-white/80"
                          disabled={broadcasting === professor.id}
                          onClick={() => handleSendBroadcast(professor)}
                        >
                          {broadcasting === professor.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Enviar lembrete'
                          )}
                        </Button>
                        <a
                          href={professor.whatsapp ? `https://wa.me/${professor.whatsapp}` : `mailto:${professor.email}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2rem] text-white/70"
                        >
                          Contato direto
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProfessors.length === 0 && (
              <p className="py-8 text-center text-sm text-white/40">Nenhum professor encontrado.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
