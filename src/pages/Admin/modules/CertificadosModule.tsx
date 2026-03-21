import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Award, RefreshCcw, ChevronRight, FilePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { getSupabaseClient } from '../../../lib/supabaseClient'

interface CertificateRow {
  id: string
  aluno_id: string
  studio_id: string | null
  emitido_em: string
  link_certificado: string | null
  status: string | null
  alunos?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null
  studios?: { name?: string | null } | null
}

const statusVariants: Record<string, 'success' | 'warning' | 'neutral'> = {
  emitido: 'success',
  pendente: 'warning',
  revisao: 'neutral',
}

export function CertificadosModule() {
  const supabase = getSupabaseClient()
  const [certificates, setCertificates] = useState<CertificateRow[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchCertificates = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('hub_certificados')
      .select('id, aluno_id, studio_id, emitido_em, link_certificado, status, alunos:aluno_id ( first_name, last_name, email ), studios:studio_id ( name )')
      .order('emitido_em', { ascending: false })
      .limit(100)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCertificates((data ?? []) as CertificateRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => (statusFilter === 'all' ? true : cert.status === statusFilter))
  }, [certificates, statusFilter])

  const handleMarkIssued = async (id: string, link: string) => {
    if (!supabase) return
    setUpdating(id)
    const { error: updateError } = await supabase
      .from('hub_certificados')
      .update({ status: 'emitido', link_certificado: link || `https://docs.thehub.com/cert/${id}` })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      await fetchCertificates()
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
            <span className="text-white/60">Certificados</span>
          </div>
          <h1 className="font-display text-3xl text-white">Emissão de Certificados</h1>
        </div>
        <Button className="bg-hub-gold text-slate-900 hover:bg-hub-gold/90 rounded-2xl px-6">
          <FilePlus className="mr-2 h-4 w-4" /> Novo Certificado
        </Button>
      </header>

      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-white/60">
          <Award className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.3rem]">Certificados</span>
        </div>
        <select
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">Todos</option>
          <option value="emitido">Emitidos</option>
          <option value="pendente">Pendentes</option>
          <option value="revisao">Em revisão</option>
        </select>
        <Button variant="ghost" className="text-white/70" onClick={fetchCertificates}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Recarregar
        </Button>
      </Card>

      <Card>
        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando certificados...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.3rem] text-white/40">
                  <th className="px-4 py-3 font-normal">Aluno</th>
                  <th className="px-4 py-3 font-normal">Turma</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Emitido em</th>
                  <th className="px-4 py-3 font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCertificates.map((cert) => {
                  const studentName = `${cert.alunos?.first_name ?? ''} ${cert.alunos?.last_name ?? ''}`.trim() ||
                    cert.alunos?.email ||
                    'Aluno'
                  return (
                    <tr key={cert.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">{studentName}</p>
                        <p className="text-xs text-white/50">{cert.alunos?.email}</p>
                      </td>
                      <td className="px-4 py-4">{cert.studios?.name ?? '-'}</td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariants[cert.status ?? 'pendente'] ?? 'neutral'}>
                          {cert.status ?? 'pendente'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-white/60">
                        {cert.emitido_em
                          ? new Date(cert.emitido_em).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            className="text-white/70"
                            disabled={updating === cert.id}
                            onClick={() => handleMarkIssued(cert.id, cert.link_certificado ?? '')}
                          >
                            {updating === cert.id ? 'Salvando...' : 'Marcar emitido'}
                          </Button>
                          {cert.link_certificado && (
                            <a
                              href={cert.link_certificado}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2rem] text-white/70"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredCertificates.length === 0 && (
              <p className="py-10 text-center text-sm text-white/40">Nenhum certificado encontrado.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
