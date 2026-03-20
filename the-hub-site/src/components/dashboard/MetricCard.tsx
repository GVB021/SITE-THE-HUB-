import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

interface MetricCardProps {
  label: string
  value: string | number
  delta?: string
  icon?: ReactNode
}

export function MetricCard({ label, value, delta, icon }: MetricCardProps) {
  return (
    <Card className="flex items-center justify-between gap-4 bg-gradient-to-br from-white/10 to-white/[0.03]">
      <div>
        <p className="text-xs uppercase tracking-[0.4rem] text-white/50">{label}</p>
        <p className="mt-2 font-display text-3xl text-white">{value}</p>
        {delta && <p className="text-sm text-white/50">{delta}</p>}
      </div>
      {icon && <div className="text-hub-gold">{icon}</div>}
    </Card>
  )
}
