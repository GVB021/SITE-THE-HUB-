import { useCallback, useEffect, useState } from 'react'
import { Loader2, MessageCircle, Inbox, Trash2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { getSupabaseClient } from '../../../lib/supabaseClient'

interface CommunicationRow {
  id: string
  canal: string
  assunto: string | null
  mensagem: string | null
  destinatario_email: string | null
  status: string | null
  created_at: string
}

const channelLabels: Record<string, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
}

const statusVariants: Record<string, 'success' | 'warning' | 'neutral'> = {
  enviado: 'success',
  agendado: 'warning',
  erro: 'neutral',
}

export function CommunicationModule() {
  const supabase = getSupabaseClient()
  const [history, setHistory] = useState<CommunicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ channel: 'email', subject: '', message: '', recipient: '' })
  const [sending, setSending] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('hub_comunicacoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setHistory((data ?? []) as CommunicationRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    setSending(true)
    const payload = {
      canal: form.channel,
      assunto: form.subject,
      mensagem: form.message,
      destinatario_email: form.recipient,
      status: 'enviado',
    }

    const { error: insertError } = await supabase.from('hub_comunicacoes').insert(payload)
    if (insertError) {
      setError(insertError.message)
    } else {
      setForm({ channel: 'email', subject: '', message: '', recipient: '' })
      fetchHistory()
    }
    setSending(false)
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    const { error: deleteError } = await supabase.from('hub_comunicacoes').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
    } else {
      setHistory((prev) => prev.filter((item) => item.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2rem] text-white/40">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Comunicação</span>
          </div>
          <h1 className="font-display text-3xl text-white">Broadcasts & Avisos</h1>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <form className="space-y-4" onSubmit={handleSend}>
            <div>
              <p className="text-xs uppercase tracking-[0.3rem] text-white/40">Enviar broadcast</p>
            </div>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
              value={form.channel}
              onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value }))}
            >
              <option value="email">E-mail</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40"
              placeholder="Assunto"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40"
              placeholder="Email do destinatário"
              value={form.recipient}
              onChange={(event) => setForm((prev) => ({ ...prev, recipient: event.target.value }))}
            />
            <textarea
              className="h-32 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40"
              placeholder="Mensagem"
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            />
            <Button type="submit" variant="outline" className="border-hub-gold/60 text-hub-gold" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar mensagem'}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60">
              <Inbox className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.3rem]">Histórico</span>
            </div>
            <Button variant="ghost" onClick={fetchHistory} className="text-white/70">
              Atualizar
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
          {loading ? (
            <div className="flex items-center justify-center py-8 text-white/60">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando mensagens...
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {history.map((message) => (
                <div key={message.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Badge variant="neutral">{channelLabels[message.canal] ?? message.canal}</Badge>
                      <span>
                        {new Date(message.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                        })}
                      </span>
                    </div>
                    <Badge variant={statusVariants[message.status ?? 'enviado'] ?? 'neutral'}>
                      {message.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{message.assunto}</p>
                  <p className="text-xs text-white/60">{message.destinatario_email}</p>
                  <p className="mt-2 text-sm text-white/80">{message.mensagem}</p>
                  <div className="mt-3 flex gap-2 text-sm text-white/70">
                    <Button variant="ghost" className="text-white/70">
                      <MessageCircle className="mr-2 h-4 w-4" /> Reenviar
                    </Button>
                    <Button variant="ghost" className="text-rose-300" onClick={() => handleDelete(message.id)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Remover
                    </Button>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="py-6 text-center text-sm text-white/40">Nenhuma comunicação registrada.</p>
              )}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
