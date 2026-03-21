import type { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-[12px] border border-[rgba(228,228,231,0.7)] bg-white px-4 py-3 text-sm text-[#09090B] placeholder:text-[#A1A1AA] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20',
        className,
      )}
      {...props}
    />
  )
}
