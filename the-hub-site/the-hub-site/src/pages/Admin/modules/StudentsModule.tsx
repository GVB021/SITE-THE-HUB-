import { useCallback, useEffect, useMemo, useState } from 'react'
import { Filter, Loader2, RefreshCcw, UserPlus, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { getSupabaseClient } from '../../../lib/supabaseClient'

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  ativo: { label: 'Ativo', variant: 'success' },
  aguardando: { label: 'Em avaliação', variant: 'warning' },
  inadimplente: { label: 'Inadimplente', variant: 'warning' },
  inativo: { label: 'Inativo', variant: 'neutral' },
}

type MembershipRelation = {
  id: string
  status: string | null
  studios?: { name?: string | null } | { name?: string | null }[] | null
}

type StudentRow = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  whatsapp: string | null
  created_at: string
  studio_memberships?: MembershipRelation[] | null
}

const buildStudentName = (student: StudentRow) =>
  `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || student.email || 'Aluno'

export function StudentsModule() {
  const supabase = getSupabaseClient()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, whatsapp, created_at, studio_memberships:studio_memberships_user_id_fkey ( id, status, studios:studio_memberships_studio_id_fkey ( name ) )')
      .eq('hub_role', 'aluno')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setStudents(data as StudentRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const membership = student.studio_memberships?.[0]
      const matchesStatus =
        statusFilter === 'all' || (membership?.status ?? 'inativo').toLowerCase() === statusFilter
      const matchesSearch = buildStudentName(student).toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [students, statusFilter, searchTerm])

  const handleStatusChange = async (membershipId: string | undefined, nextStatus: string) => {
    if (!supabase || !membershipId) return
    setUpdating(membershipId)
    try {
      const { error: updateError } = await supabase
        .from('studio_memberships')
        .update({ status: nextStatus })
        .eq('id', membershipId)

      if (updateError) {
        throw updateError
      }
      await fetchStudents()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Falha ao atualizar status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2rem] text-white/40">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Alunos</span>
          </div>
          <h1 className="font-display text-3xl text-white">Gestão de Alunos</h1>
        </div>
        <Button className="bg-hub-gold text-slate-900 hover:bg-hub-gold/90 rounded-2xl px-6">
          <UserPlus className="mr-2 h-4 w-4" /> Novo Aluno
        </Button>
      </header>

      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-white/60">
          <Filter className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.3rem]">Filtrar</span>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="aguardando">Em avaliação</option>
          <option value="inadimplente">Inadimplentes</option>
          <option value="inativo">Inativos</option>
        </select>
        <input
          type="text"
          placeholder="Buscar por nome ou email"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="flex-1 min-w-[200px] rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40"
        />
        <Button variant="ghost" onClick={fetchStudents} className="text-white">
          <RefreshCcw className="h-4 w-4" /> Atualizar
        </Button>
      </Card>

      <Card>
        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando alunos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.3rem] text-white/40">
                  <th className="px-4 py-3 font-normal">Aluno</th>
                  <th className="px-4 py-3 font-normal">Turma</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Contato</th>
                  <th className="px-4 py-3 font-normal">Ingressou</th>
                  <th className="px-4 py-3 font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => {
                  const membership = student.studio_memberships?.[0]
                  const studio = membership?.studios
                  const studioName = Array.isArray(studio) ? studio[0]?.name : studio?.name
                  const statusKey = (membership?.status ?? 'inativo').toLowerCase()
                  const statusInfo = statusLabels[statusKey] ?? statusLabels.inativo
                  return (
                    <tr key={student.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">{buildStudentName(student)}</p>
                        <p className="text-xs text-white/40">{student.email}</p>
                      </td>
                      <td className="px-4 py-4">{studioName ?? 'Sem turma'}</td>
                      <td className="px-4 py-4">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <p>{student.whatsapp ?? '-'}</p>
                      </td>
                      <td className="px-4 py-4 text-white/60">
                        {new Date(student.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            className="border-white/20 text-white/80"
                            disabled={updating === membership?.id}
                            onClick={() => handleStatusChange(membership?.id, 'ativo')}
                          >
                            {updating === membership?.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Ativar'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-rose-400/60 text-rose-200"
                            onClick={() => handleStatusChange(membership?.id, 'inadimplente')}
                            disabled={updating === membership?.id}
                          >
                            Inadimplente
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <p className="py-8 text-center text-sm text-white/40">Nenhum aluno encontrado para o filtro atual.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
