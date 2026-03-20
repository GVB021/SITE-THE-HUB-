import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  Award,
  MessageCircle,
  Mic2,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { faq, teachers, testimonials } from '../../data/mocks'
import { useInViewAnimation } from '../../hooks/useInViewAnimation'
import type { Teacher } from '../../types'

const SLOT_TOTAL = 8
const INITIAL_OCCUPIED = 6
const COUNTDOWN_TARGET = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
const differentiators = [
  {
    title: 'Apenas 8 vagas por turma',
    description: 'Mentorias individuais e acompanhamento semanal com diretores do estúdio.',
    icon: Users,
  },
  {
    title: 'Aprenda com o casting oficial',
    description: 'Os mesmos diretores que aprovam vozes para Netflix, Disney e HBO.',
    icon: ShieldCheck,
  },
  {
    title: 'Certificado reconhecido',
    description: 'Documento assinado pelo corpo diretivo do HUB e parceiros internacionais.',
    icon: Award,
  },
]

function getTimeRemaining() {
  const now = new Date().getTime()
  const distance = COUNTDOWN_TARGET.getTime() - now
  const total = Math.max(distance, 0)
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  }
}

export default function LandingPage() {
  const [slotsFilled, setSlotsFilled] = useState(0)
  const [alumniCount, setAlumniCount] = useState(0)
  const [teacherIndex, setTeacherIndex] = useState(0)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [countdown, setCountdown] = useState(getTimeRemaining())
  const [audioOn, setAudioOn] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const heroAnim = useInViewAnimation<HTMLDivElement>()
  const diffAnim = useInViewAnimation<HTMLDivElement>()
  const teacherAnim = useInViewAnimation<HTMLDivElement>()
  const testimonialAnim = useInViewAnimation<HTMLDivElement>()
  const urgencyAnim = useInViewAnimation<HTMLDivElement>()

  useEffect(() => {
    const interval = setInterval(() => {
      setSlotsFilled((prev) => {
        if (prev >= INITIAL_OCCUPIED) {
          clearInterval(interval)
          return INITIAL_OCCUPIED
        }
        return prev + 1
      })
    }, 400)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setAlumniCount((prev) => {
        if (prev >= 340) {
          clearInterval(interval)
          return 340
        }
        return prev + 4
      })
    }, 80)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeRemaining()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.15
    if (audioOn) {
      audio.play().catch(() => setAudioOn(false))
    } else {
      audio.pause()
    }
  }, [audioOn])

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTeacher(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const remainingSlots = Math.max(SLOT_TOTAL - slotsFilled, 0)

  const currentTestimonial = testimonials[testimonialIndex]

  const handleTestimonialNav = (index: number) => {
    setTestimonialIndex(index)
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#09090B]">
      <section
        ref={heroAnim.ref}
        className={clsx(
          'relative isolate min-h-[90vh] bg-white',
          'fade-slide',
          heroAnim.inView && 'in-view',
        )}
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.96)), url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-24 md:flex-row md:items-center md:py-32">
          <div className="max-w-2xl space-y-6">
            <Badge className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#C9A84C]">
              <Mic2 className="h-4 w-4" />
              Instituto de Dublagem
            </Badge>
            <h1 className="font-bold text-4xl leading-tight text-[#09090B] md:text-6xl">
              THE HUB — Escola de Dublagem e Artes Cênicas
            </h1>
            <p className="text-base text-[#71717A] md:text-lg">
              Formação institucional para intérpretes de voz com foco em excelência técnica, repertório
              autoral e relacionamento com os maiores estúdios de audiovisual.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/matricula">
                <Button className="px-10 py-3 text-base">Iniciar matrícula</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="px-10 py-3 text-base">
                  Área do aluno
                </Button>
              </Link>
            </div>
          </div>
          <div className="space-y-4 rounded-[12px] border border-[rgba(228,228,231,0.5)] bg-white p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.3rem] text-[#71717A]">Destaque institucional</p>
            <p className="text-sm text-[#09090B]">
              Certificações exclusivas assinadas por diretores artísticos e acesso a audições proprietárias da Hub.
            </p>
          </div>
        </div>
      </section>

      <section
        id="sobre"
        ref={diffAnim.ref}
        className={clsx(
          'bg-[#F4F4F5] py-20',
          'fade-slide',
          diffAnim.inView && 'in-view',
        )}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 md:grid-cols-2">
          {differentiators.map((diff) => (
            <Card
              key={diff.title}
              className="flex gap-4 border-l-4 border-[#2563EB] bg-white shadow-card"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10">
                <diff.icon className="h-6 w-6 text-[#2563EB]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-[#09090B]">{diff.title}</h3>
                <p className="text-sm text-[#71717A]">{diff.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="professores"
        ref={teacherAnim.ref}
        className={clsx('bg-white py-24', 'fade-slide', teacherAnim.inView && 'in-view')}
      >
        <div className="mx-auto w-full max-w-6xl space-y-12 px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4rem] text-[#2563EB]">Corpo docente</p>
            <h2 className="font-bold text-4xl text-[#09090B]">Diretores, intérpretes e preparadores</h2>
            <div className="mt-3 h-[1px] w-20 bg-[#2563EB]" />
            <p className="mt-4 max-w-3xl text-sm text-[#71717A]">
              Seleção de especialistas com prêmios internacionais e participação ativa em produções de streaming,
              cinema e games AAA.
            </p>
          </div>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${teacherIndex * 100}%)`, width: `${teachers.length * 100}%` }}
            >
              {teachers.map((teacher) => (
                <div key={teacher.id} className="w-full flex-shrink-0 px-2 md:px-4">
                  <TeacherSlideCard teacher={teacher} onSelect={() => setSelectedTeacher(teacher)} />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {teachers.map((teacher, index) => (
                <button
                  key={teacher.id}
                  type="button"
                  className={clsx(
                    'h-2 w-6 rounded-full transition-all',
                    teacherIndex === index ? 'bg-[#2563EB]' : 'bg-[rgba(228,228,231,0.5)]',
                  )}
                  onClick={() => setTeacherIndex(index)}
                  aria-label={`Ir para o professor ${teacher.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={testimonialAnim.ref}
        className={clsx('bg-[#F4F4F5] py-24', 'fade-slide', testimonialAnim.inView && 'in-view')}
      >
        <div className="mx-auto w-full max-w-5xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4rem] text-[#2563EB]">O que dizem nossos alunos</p>
          <h2 className="mt-3 font-bold text-4xl text-[#09090B]">
            Histórias reais de quem saiu da cabine com contrato assinado
          </h2>
          <div className="mt-12 space-y-6 rounded-[12px] border border-[rgba(228,228,231,0.5)] bg-white p-10 shadow-card">
            <div className="flex justify-center gap-1 text-[#C9A84C]">
              {Array.from({ length: currentTestimonial.rating }).map((_, index) => (
                <Star key={index} className="h-5 w-5 animate-star" fill="currentColor" />
              ))}
            </div>
            <p className="text-xl text-[#09090B]/90">“{currentTestimonial.text}”</p>
            <div className="flex flex-col items-center gap-2 text-sm text-[#71717A]">
              <img
                src={currentTestimonial.avatar}
                alt={currentTestimonial.name}
                className="h-16 w-16 rounded-full border-2 border-[#2563EB] object-cover"
              />
              <strong className="text-lg text-[#09090B]">{currentTestimonial.name}</strong>
              <span>{currentTestimonial.city}</span>
              <Badge variant="success">Aluno verificado</Badge>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {testimonials.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTestimonialNav(index)}
                  className={clsx(
                    'h-3 w-3 rounded-full border border-[#2563EB] transition',
                    testimonialIndex === index ? 'bg-[#2563EB]' : 'bg-transparent',
                  )}
                  aria-label={`Mostrar depoimento de ${item.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F4F5] py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
          <Card id="faq" className="space-y-4 bg-white p-8 shadow-card">
            <div>
              <p className="text-xs uppercase tracking-[0.4rem] text-[#2563EB]">FAQ</p>
              <h2 className="font-bold text-3xl text-[#09090B]">Perguntas frequentes</h2>
            </div>
            <div className="divide-y divide-[rgba(228,228,231,0.5)]">
              {faq.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer justify-between text-sm font-semibold text-[#09090B]">
                    {item.question}
                    <span className="text-[#2563EB]">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-[#71717A]">{item.answer}</p>
                </details>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 bg-white p-8 shadow-card">
            <p className="text-xs uppercase tracking-[0.4rem] text-[#2563EB]">Por que agora?</p>
            <h3 className="font-bold text-3xl text-[#09090B]">+{alumniCount} vozes transformadas</h3>
            <p className="text-sm text-[#71717A]">
              Cada turma inaugura novas conexões com estúdios parceiros. Junte-se a quem participa dos próximos
              testes de elenco fechados.
            </p>
          </Card>
        </div>
      </section>

      <section
        ref={urgencyAnim.ref}
        className={clsx(
          'bg-[#2563EB] py-20 text-white',
          'fade-slide',
          urgencyAnim.inView && 'in-view',
        )}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4rem] text-white/70">A próxima turma começa em breve</p>
          <h2 className="font-bold text-4xl text-white">
            O relógio não espera. Garanta seu acesso antes do fechamento da audição.
          </h2>
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(countdown).map(([label, value]) => (
              <div key={label} className="rounded-[12px] border border-white/20 bg-white p-4">
                <div className="text-3xl font-bold text-[#2563EB]">{value.toString().padStart(2, '0')}</div>
                <p className="text-xs uppercase tracking-[0.3rem] text-[#71717A]">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-white/80">
            Restam apenas{' '}
            <span className="pulsing-number text-2xl font-bold text-white">{remainingSlots}</span>{' '}
            vagas antes da seleção final.
          </p>
          <Link to="/matricula" className="w-full max-w-md">
            <Button className="w-full bg-white text-[#2563EB] hover:bg-gray-50 px-10 py-3 text-base">
              GARANTIR MINHA VAGA
            </Button>
          </Link>
        </div>
      </section>

      {selectedTeacher && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="teacher-modal">
            <button
              type="button"
              className="absolute right-4 top-4 text-sm uppercase tracking-[0.3rem] text-[#71717A] hover:text-[#09090B]"
              onClick={() => setSelectedTeacher(null)}
            >
              Fechar
            </button>
            <div className="flex flex-col gap-6 md:flex-row">
              <img
                src={selectedTeacher.avatar}
                alt={selectedTeacher.name}
                className="h-48 w-48 rounded-full border-4 border-[#2563EB] object-cover md:h-56 md:w-56"
              />
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3rem] text-[#2563EB]">
                    {selectedTeacher.title}
                  </p>
                  <h3 className="font-bold text-4xl text-[#09090B]">{selectedTeacher.name}</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.3rem] text-[#71717A]">Personagens icônicos</p>
                  <ul className="space-y-2 text-[#09090B]">
                    {selectedTeacher.characters.map((character) => (
                      <li key={character} className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-[#2563EB]" />
                        {character}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-[#71717A]">{selectedTeacher.bioFull}</p>
                <Link to="/matricula">
                  <Button className="w-full">Quero aprender com {selectedTeacher.name}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <a
        href="https://wa.me/551140028922"
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp"
      >
        <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
      </a>
    </div>
  )
}

type TeacherSlideCardProps = {
  teacher: Teacher
  onSelect: () => void
}

function TeacherSlideCard({ teacher, onSelect }: TeacherSlideCardProps) {
  return (
    <Card
      onClick={onSelect}
      className="group flex cursor-pointer flex-col items-center gap-4 border border-[rgba(228,228,231,0.5)] bg-white p-10 text-center shadow-card transition-shadow hover:shadow-lg"
    >
      <img
        src={teacher.avatar}
        alt={teacher.name}
        className="h-36 w-36 rounded-full border-4 border-[#2563EB] object-cover"
      />
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4rem] text-[#2563EB]">{teacher.title}</p>
        <h3 className="font-bold text-3xl text-[#09090B]">{teacher.name}</h3>
        <p className="text-sm italic text-[#2563EB]">{teacher.characters.join(', ')}</p>
        <p className="text-sm text-[#71717A]">{teacher.bio}</p>
        <span className="text-xs uppercase tracking-[0.3rem] text-[#71717A]">
          Clique para ver detalhes
        </span>
      </div>
    </Card>
  )
}
