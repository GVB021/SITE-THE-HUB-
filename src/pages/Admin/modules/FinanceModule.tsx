import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, TrendingUp, Wallet, ChevronRight, FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { getSupabaseClient } from '../../../lib/supabaseClient'
import { PDFReportService } from '../../../services/pdfReportService'

interface PaymentRow {
  id: string
  user_id: string | null
  mes_referencia: string | null
  valor: number | null
  status: string | null
  created_at: string
  users?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null
}

const statusVariants: Record<string, 'success' | 'warning' | 'neutral'> = {
  pago: 'success',
  pendente: 'warning',
  aguardando: 'neutral',
}

const formatBRL = (value?: number | null) =>
  (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function FinanceModule() {
  const supabase = getSupabaseClient()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const fetchPayments = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('hub_pagamentos')
      .select('id, user_id, mes_referencia, valor, status, created_at, users:user_id ( first_name, last_name, email )')
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPayments((data ?? []) as PaymentRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const summary = useMemo(() => {
    const paid = payments.filter((payment) => payment.status === 'pago').reduce((sum, item) => sum + (item.valor ?? 0), 0)
    const pending = payments.filter((payment) => payment.status !== 'pago').reduce((sum, item) => sum + (item.valor ?? 0), 0)
    return { paid, pending }
  }, [payments])

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => (statusFilter === 'all' ? true : payment.status === statusFilter))
  }, [payments, statusFilter])

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!supabase) return
    setUpdating(id)
    const { error: updateError } = await supabase
      .from('hub_pagamentos')
      .update({ status: newStatus })
      .eq('id', id)
    if (updateError) setError(updateError.message)
    else await fetchPayments()
    setUpdating(null)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const currentDate = new Date()
      const month = currentDate.toLocaleDateString('en-US', { month: 'long' })
      const year = currentDate.getFullYear()
      
      const financialData = await PDFReportService.fetchFinancialData(month, year)
      const pdfBlob = await PDFReportService.generateFinancialReport(financialData)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `financial-report-${month}-${year}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      setError('Failed to export PDF report')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2rem] text-white/40">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Financeiro</span>
          </div>
          <h1 className="font-display text-3xl text-white">Gestão Financeira</h1>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-2xl px-6" onClick={handleExportPDF} disabled={isExporting}>
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          {isExporting ? 'Exportando...' : 'Exportar Relatório'}
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-white/40">Receita confirmada</p>
            <p className="font-display text-3xl text-white">{formatBRL(summary.paid)}</p>
          </div>
          <Wallet className="h-8 w-8 text-hub-gold" />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3rem] text-white/40">Em aberto</p>
            <p className="font-display text-3xl text-white">{formatBRL(summary.pending)}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-hub-gold" />
        </Card>
      </section>

      <Card className="flex flex-wrap items-center gap-4">
        <select
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="pago">Pagos</option>
          <option value="pendente">Pendentes</option>
          <option value="aguardando">Aguardando</option>
        </select>
        <Button variant="ghost" className="text-white/80" onClick={fetchPayments}>
          Recarregar
        </Button>
      </Card>

      <Card>
        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando pagamentos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.3rem] text-white/40">
                  <th className="px-3 py-3 font-normal">Aluno</th>
                  <th className="px-3 py-3 font-normal">Mês</th>
                  <th className="px-3 py-3 font-normal">Valor</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Registrado</th>
                  <th className="px-3 py-3 font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.map((payment) => {
                  const name = `${payment.users?.first_name ?? ''} ${payment.users?.last_name ?? ''}`.trim() ||
                    payment.users?.email ||
                    'Aluno'
                  const statusKey = payment.status ?? 'aguardando'
                  return (
                    <tr key={payment.id}>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">{name}</p>
                        <p className="text-xs text-white/40">{payment.users?.email}</p>
                      </td>
                      <td className="px-3 py-3">{payment.mes_referencia ?? '-'}</td>
                      <td className="px-3 py-3">{formatBRL(payment.valor)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={statusVariants[statusKey] ?? 'neutral'}>{statusKey}</Badge>
                      </td>
                      <td className="px-3 py-3 text-white/60">
                        {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            className="border-white/10 text-white/80"
                            disabled={updating === payment.id}
                            onClick={() => handleStatusUpdate(payment.id, 'pago')}
                          >
                            {updating === payment.id ? 'Salvando...' : 'Confirmar'}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/20 text-white/70"
                            disabled={updating === payment.id}
                            onClick={() => handleStatusUpdate(payment.id, 'pendente')}
                          >
                            Reabrir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <p className="py-10 text-center text-sm text-white/40">Nenhum pagamento para o filtro selecionado.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
