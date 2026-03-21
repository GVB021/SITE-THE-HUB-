import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('hub-card relative p-6 transition-colors duration-200', className)}
      {...props}
    />
  )
}
