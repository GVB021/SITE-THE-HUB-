import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

const variants = {
  success: 'bg-[#1D2A1F] text-[#86d38b] border-[#86d38b]/40',
  warning: 'bg-[#2c2415] text-[#C9A84C] border-[#C9A84C]/30',
  neutral: 'bg-[#1A1A1A] text-[#B5B5B5] border-white/10',
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-[4px] border px-3 py-1 text-xs uppercase tracking-[0.25rem]',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
