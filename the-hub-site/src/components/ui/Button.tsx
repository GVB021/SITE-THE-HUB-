import type { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline'
  fullWidth?: boolean
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-sm font-semibold transition-colors duration-200'

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/30',
  ghost:
    'border border-[rgba(228,228,231,0.5)] bg-transparent text-[#09090B] hover:border-[#2563EB] hover:text-[#2563EB]',
  outline:
    'border border-[#2563EB] bg-transparent text-[#2563EB] hover:bg-[#2563EB]/10',
}

export function Button({
  variant = 'primary',
  fullWidth,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(baseStyles, variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  )
}
