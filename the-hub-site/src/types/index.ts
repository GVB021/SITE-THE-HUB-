export type Role = 'student' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface Teacher {
  id: string
  name: string
  avatar: string
  title: string
  characters: string[]
  bio: string
  bioFull: string
}

export interface Cohort {
  id: string
  name: string
  schedule: string
  seats: number
  availableSpots: number
}

export interface FAQItem {
  question: string
  answer: string
}

export interface StudentProfile {
  id: string
  name: string
  email: string
  whatsapp: string
  cohort: Cohort
  professor: Teacher
  nextClass: string
  status: 'Ativa' | 'Inativa'
  payments: Array<{ month: string; status: 'Pago' | 'Pendente'; value: number }>
}

export interface AdminMetrics {
  revenue: number
  activeStudents: number
  openCohorts: number
  conversionRate: number
}

export interface CommissionRecord {
  id: string
  seller: string
  student: string
  coupon: string
  commission: number
  status: 'A pagar' | 'Pago'
}

export interface Coupon {
  code: string
  owner: string
  conversions: number
}

export interface Message {
  id: string
  sender: string
  channel: 'WhatsApp' | 'Email' | 'Instagram'
  subject: string
  timestamp: string
  status: 'Novo' | 'Respondido'
}

export interface Testimonial {
  id: string
  name: string
  city: string
  avatar: string
  text: string
  rating: number
}
