import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Percent, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { getSupabaseClient } from '../../../lib/supabaseClient'

interface CouponRow {
  id: string
  codigo: string
  owner: string | null
  desconto: number | null
  max_uso: number | null
  usos_realizados: number | null
  ativo: boolean
}

export function CouponsModule() {
  const supabase = getSupabaseClient()
  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchCoupons = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('hub_cupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCoupons((data ?? []) as CouponRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => (showActiveOnly ? coupon.ativo : true))
  }, [coupons, showActiveOnly])

  const handleCreateCoupon = async () => {
    if (!supabase) return
    setCreating(true)
    const payload = {
      codigo: `HUB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      owner: 'Equipe Comercial',
      desconto: 10,
      max_uso: 30,
      usos_realizados: 0,
      ativo: true,
    }

    const { error: insertError } = await supabase.from('hub_cupons').insert(payload)
    if (insertError) {
      setError(insertError.message)
    } else {
      await fetchCoupons()
    }
    setCreating(false)
  }

  const toggleCoupon = async (coupon: CouponRow) => {
    if (!supabase) return
    const { error: updateError } = await supabase
      .from('hub_cupons')
      .update({ ativo: !coupon.ativo })
      .eq('id', coupon.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setCoupons((prev) => prev.map((item) => (item.id === coupon.id ? { ...item, ativo: !coupon.ativo } : item)))
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2rem] text-white/40">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Cupons</span>
          </div>
          <h1 className="font-display text-3xl text-white">Cupons de Desconto</h1>
        </div>
        <Button className="bg-hub-gold text-slate-900 hover:bg-hub-gold/90 rounded-2xl px-6" onClick={handleCreateCoupon} disabled={creating}>
          <Plus className="mr-2 h-4 w-4" /> {creating ? 'Gerando...' : 'Novo Cupom'}
        </Button>
      </header>

      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-white/60">
          <Percent className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.3rem]">Cupons</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(event) => setShowActiveOnly(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-black/40"
          />
          Mostrar apenas ativos
        </label>
        <Button variant="ghost" onClick={fetchCoupons} className="text-white/70">
          Atualizar
        </Button>
      </Card>

      <Card>
        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando cupons...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.3rem] text-white/40">
                  <th className="px-4 py-3 font-normal">Código</th>
                  <th className="px-4 py-3 font-normal">Responsável</th>
                  <th className="px-4 py-3 font-normal">Uso</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{coupon.codigo}</p>
                      <p className="text-xs text-white/50">{coupon.desconto}% off</p>
                    </td>
                    <td className="px-4 py-4">{coupon.owner ?? 'Equipe comercial'}</td>
                    <td className="px-4 py-4">
                      {coupon.usos_realizados ?? 0} / {coupon.max_uso ?? '∞'}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={coupon.ativo ? 'success' : 'neutral'}>
                        {coupon.ativo ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" className="text-white/70" onClick={() => toggleCoupon(coupon)}>
                          {coupon.ativo ? 'Desativar' : 'Reativar'}
                        </Button>
                        <Button variant="outline" className="border-white/20 text-white/70">
                          Compartilhar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCoupons.length === 0 && (
              <p className="py-10 text-center text-sm text-white/40">Nenhum cupom disponível.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
