import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building, Loader2, RefreshCcw, Plus, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { getSupabaseClient } from '../../../lib/supabaseClient'

interface StudioRow {
  id: string
  name: string
  modalidade: string | null
  dia_semana: string | null
  horario_inicio: string | null
  horario_fim: string | null
  vagas_total: number | null
  vagas_ocupadas: number | null
  is_active: boolean
  professor: { nome?: string | null } | { nome?: string | null }[] | null
}

export function StudiosModule() {
  const supabase = getSupabaseClient()
  const [studios, setStudios] = useState<StudioRow[]>([])
  const [modalidadeFilter, setModalidadeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchStudios = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('studios')
      .select('id, name, modalidade, dia_semana, horario_inicio, horario_fim, vagas_total, vagas_ocupadas, is_active, professor:professor_id ( nome )')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setStudios((data ?? []) as StudioRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchStudios()
  }, [fetchStudios])

  const filteredStudios = useMemo(() => {
    return studios.filter((studio) =>
      modalidadeFilter ? studio.modalidade?.toLowerCase() === modalidadeFilter : true,
    )
  }, [studios, modalidadeFilter])

  const handleToggleActive = async (studioId: string, nextState: boolean) => {
    if (!supabase) return
    setUpdating(studioId)
    const { error: updateError } = await supabase
      .from('studios')
      .update({ is_active: nextState })
      .eq('id', studioId)

    if (updateError) {
      setError(updateError.message)
    } else {
      await fetchStudios()
    }
    setUpdating(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2rem] text-white/40">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Studios</span>
          </div>
          <h1 className="font-display text-3xl text-white">Gestão de Studios</h1>
        </div>
        <Button className="bg-hub-gold text-slate-900 hover:bg-hub-gold/90 rounded-2xl px-6">
          <Plus className="mr-2 h-4 w-4" /> Novo Studio
        </Button>
      </header>

      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-white/60">
          <Building className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.3rem]">Studios</span>
        </div>
        <select
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
          value={modalidadeFilter}
          onChange={(event) => setModalidadeFilter(event.target.value)}
        >
          <option value="">Todas modalidades</option>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
          <option value="premium">Premium</option>
        </select>
        <Button variant="ghost" className="text-white/80" onClick={fetchStudios}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </Card>

      <Card>
        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando estúdios...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredStudios.map((studio) => {
              const professorInfo = Array.isArray(studio.professor)
                ? studio.professor[0]
                : studio.professor
              const ocupacao = `${studio.vagas_ocupadas ?? 0}/${studio.vagas_total ?? 0}`
              const almostFull = (studio.vagas_total ?? 0) - (studio.vagas_ocupadas ?? 0) <= 1
              return (
                <div key={studio.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3rem] text-white/40">{studio.modalidade}</p>
                      <h3 className="font-display text-2xl text-white">{studio.name}</h3>
                      <p className="text-sm text-white/60">
                        {studio.dia_semana} • {studio.horario_inicio} - {studio.horario_fim}
                      </p>
                    </div>
                    <Badge variant={studio.is_active ? 'success' : 'neutral'}>
                      {studio.is_active ? 'Ativo' : 'Pausado'}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-white/70">
                    <p>
                      Mentor:{' '}
                      <span className="text-white">{professorInfo?.nome ?? 'A definir'}</span>
                    </p>
                    <p>
                      Ocupação:{' '}
                      <span className={almostFull ? 'text-hub-gold' : 'text-white'}>{ocupacao}</span>
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      className="border-white/10 text-white/80"
                      onClick={() => handleToggleActive(studio.id, !studio.is_active)}
                      disabled={updating === studio.id}
                    >
                      {updating === studio.id
                        ? 'Atualizando...'
                        : studio.is_active
                          ? 'Pausar turma'
                          : 'Reativar turma'}
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white/80">
                      Ver alunos
                    </Button>
                  </div>
                </div>
              )
            })}
            {filteredStudios.length === 0 && (
              <p className="py-10 text-center text-sm text-white/40">Nenhum estúdio encontrado.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
