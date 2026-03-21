import type {
  AdminMetrics,
  Cohort,
  CommissionRecord,
  Coupon,
  FAQItem,
  Message,
  StudentProfile,
  Teacher,
  Testimonial,
} from '../types'

export const teachers: Teacher[] = [
  {
    id: 't1',
    name: 'Marina Rios',
    avatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=280&q=80',
    title: 'Diretora artística e dubladora principal',
    characters: ['Mulher-Maravilha', 'Daenerys Targaryen'],
    bio: 'Dubladora há 12 anos e mentora de vozes icônicas para streaming.',
    bioFull:
      'Marina treinou elencos para produções vencedoras de Emmy, assina direções para Warner e Paramount e conduz mentorias individuais de interpretação e construção de persona vocal.',
  },
  {
    id: 't2',
    name: 'Henrique Vidal',
    avatar:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=280&q=80',
    title: 'Especialista em animação e games AAA',
    characters: ['Miles Morales', 'Izuku Midoriya'],
    bio: 'Especialista em vozes jovens para animação e games.',
    bioFull:
      'Henrique é consultor de localização em Los Angeles, responsável por coordenar testes de voz para franquias da Disney e supervisão de sincronismo para games AAA.',
  },
  {
    id: 't3',
    name: 'Carla Moura',
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=280&q=80',
    title: 'Coach vocal e preparadora de elenco',
    characters: ['Hermione Granger', 'Nami'],
    bio: 'Coach vocal e cantora com foco em respiração e intenção.',
    bioFull:
      'Carla assina preparações para musicais da Broadway em São Paulo, atua com fisiologia vocal aplicada e conduz imersões de interpretação corporal + dublagem.',
  },
]

export const testimonials: Testimonial[] = [
  {
    id: 'dep1',
    name: 'Luca Menezes',
    city: 'Porto Alegre, RS',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    text: 'Em três meses entrei para o casting da HBO. O HUB me colocou em contato direto com quem decide.',
    rating: 5,
  },
  {
    id: 'dep2',
    name: 'Amanda Soares',
    city: 'São Paulo, SP',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    text: 'Nunca tinha pisado em um estúdio. Hoje dublo realities para a Netflix com confiança total.',
    rating: 5,
  },
  {
    id: 'dep3',
    name: 'Diego Albuquerque',
    city: 'Recife, PE',
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80',
    text: 'Os feedbacks 1:1 e as audições proprietárias abriram portas que eu nem sabia que existiam.',
    rating: 5,
  },
]

export const faq: FAQItem[] = [
  {
    question: 'As aulas são online ou presenciais?',
    answer: 'Totalmente online via estúdio virtual com captação de áudio em alta qualidade.',
  },
  {
    question: 'Preciso ter experiência prévia?',
    answer: 'Não. Temos trilha para iniciantes e planos avançados para quem já atua no mercado.',
  },
  {
    question: 'Como funciona a seleção de turmas?',
    answer: 'Nossa equipe avalia disponibilidade e perfil para manter turmas reduzidas com até 8 alunos.',
  },
  {
    question: 'O pagamento é mensal?',
    answer: 'Sim, R$ 300/mês. Você pode cancelar quando quiser sem multa.',
  },
]

export const studentProfile: StudentProfile = {
  id: 'stu-01',
  name: 'Isabela Costa',
  email: 'isa@thehub.com',
  whatsapp: '+55 11 99999-1234',
  cohort: {
    id: 'cohort-a',
    name: 'Audiovisual Avançado',
    schedule: 'Quartas • 19h-21h',
    seats: 8,
    availableSpots: 2,
  },
  professor: teachers[0],
  nextClass: '27 de março, 19h',
  status: 'Ativa',
  payments: [
    { month: 'Janeiro', status: 'Pago', value: 300 },
    { month: 'Fevereiro', status: 'Pago', value: 300 },
    { month: 'Março', status: 'Pendente', value: 300 },
  ],
}

export const adminMetrics: AdminMetrics = {
  revenue: 42000,
  activeStudents: 132,
  openCohorts: 5,
  conversionRate: 36,
}

export const cohorts: Cohort[] = [
  {
    id: 'cohort-a',
    name: 'Audiovisual Avançado',
    schedule: 'Quartas • 19h-21h',
    seats: 8,
    availableSpots: 2,
  },
  {
    id: 'cohort-b',
    name: 'Games & Animação',
    schedule: 'Sábados • 10h-12h',
    seats: 8,
    availableSpots: 3,
  },
  {
    id: 'cohort-c',
    name: 'Narrativa Comercial',
    schedule: 'Terças • 20h-22h',
    seats: 8,
    availableSpots: 1,
  },
]

export const commissions: CommissionRecord[] = [
  {
    id: 'c1',
    seller: 'Luiza Prado',
    student: 'Isabela Costa',
    coupon: 'LU-VOZ',
    commission: 120,
    status: 'Pago',
  },
  {
    id: 'c2',
    seller: 'Studio Vox',
    student: 'Pedro Lima',
    coupon: 'VOX10',
    commission: 200,
    status: 'A pagar',
  },
]

export const coupons: Coupon[] = [
  { code: 'LU-VOZ', owner: 'Luiza Prado', conversions: 18 },
  { code: 'VOX10', owner: 'Studio Vox', conversions: 11 },
  { code: 'HUBMAX', owner: 'Equipe Comercial', conversions: 24 },
]

export const studentsList = [
  {
    id: 'stu-01',
    name: 'Isabela Costa',
    cohort: 'Audiovisual Avançado',
    professor: 'Marina Rios',
    status: 'Ativa',
  },
  {
    id: 'stu-02',
    name: 'Pedro Lima',
    cohort: 'Games & Animação',
    professor: 'Henrique Vidal',
    status: 'Ativa',
  },
  {
    id: 'stu-03',
    name: 'Bianca Freitas',
    cohort: 'Narrativa Comercial',
    professor: 'Carla Moura',
    status: 'Em avaliação',
  },
]

export const sellers = [
  { id: 'sel-01', name: 'Luiza Prado', leads: 42, conversions: 18 },
  { id: 'sel-02', name: 'Studio Vox', leads: 25, conversions: 11 },
  { id: 'sel-03', name: 'Equipe Comercial', leads: 88, conversions: 24 },
]

export const messages: Message[] = [
  {
    id: 'msg-01',
    sender: 'Julia Mendes',
    channel: 'WhatsApp',
    subject: 'Teste de voz enviado',
    timestamp: 'Hoje • 09h12',
    status: 'Novo',
  },
  {
    id: 'msg-02',
    sender: 'Netflix Brasil',
    channel: 'Email',
    subject: 'Convite para parceria',
    timestamp: 'Ontem • 18h30',
    status: 'Respondido',
  },
  {
    id: 'msg-03',
    sender: 'Gabriel Costa',
    channel: 'Instagram',
    subject: 'Quero abrir nova turma',
    timestamp: '17 Mar • 14h45',
    status: 'Novo',
  },
]
