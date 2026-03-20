import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    type: 'academy',
    badge: 'NOVA TURMA',
    badgeColor: 'blue',
    title: 'THE HUB ACADEMY',
    subtitle: 'Formação Profissional em Dublagem Remota',
    cta: 'Garantir minha vaga',
    ctaLink: '/matricula',
    backgroundImage: 'https://cdn.leonardo.ai/users/7dfa7b20-7c61-4905-8cb9-f4bc30f77db9/generations/df457d0a-47e3-4b36-bd87-078c8b5d6b2c/Phoenix_10_Cinematic_movie_poster_background_dramatic_professi_1.jpg',
  },
  {
    id: 2,
    type: 'teacher',
    badge: 'PROFESSOR CONFIRMADO',
    badgeColor: 'gold',
    title: 'Aprenda com o dublador do Batman',
    subtitle: 'Ettore Zuim — Batman, Mihawk, Hércules, Capitão Frio, Owen Wilson e muito mais',
    cta: 'Conhecer o curso',
    ctaLink: '/professores/ettore-zuim',
    backgroundImage: 'https://cdn.leonardo.ai/users/7dfa7b20-7c61-4905-8cb9-f4bc30f77db9/generations/1f1246d6-5a0a-6ca0-b4bf-4a97bac442fc/nano-banana-2_Professional_voice_actor_standing_dramatically_in_a_cinematic_recording_studio_s-0.jpg',
  },
]

const SLIDE_DURATION = 6000
const TRANSITION_DURATION = 1200

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex items-center">
        <span className="text-xl font-bold tracking-tight text-white">THE</span>
        <span className="ml-1 text-xl font-bold tracking-tight text-[#C9A84C]">HUB</span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [showArrows, setShowArrows] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<{ name: string; bio: string; image: string } | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goToSlide = useCallback((index: number, dir: 'next' | 'prev' = 'next') => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDirection(dir)
    setCurrentSlide(index)
    setProgress(0)
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION)
  }, [isTransitioning])

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % slides.length
    goToSlide(next, 'next')
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    const prev = (currentSlide - 1 + slides.length) % slides.length
    goToSlide(prev, 'prev')
  }, [currentSlide, goToSlide])

  // Auto-play progress bar
  useEffect(() => {
    if (isPaused || isTransitioning) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      return
    }

    const interval = 50 // Update every 50ms
    const step = (interval / SLIDE_DURATION) * 100

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide()
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [isPaused, isTransitioning, nextSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])


  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      {/* Progress Bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 w-full bg-white/10">
        <div
          className="h-full bg-[#C9A84C] transition-all ease-linear"
          style={{
            width: `${progress}%`,
            transitionDuration: isPaused ? '0ms' : '50ms',
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-4 md:px-12">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/professores" className="text-sm font-medium text-white/90 transition hover:text-white">
            Professores
          </Link>
          <Link to="/turmas" className="text-sm font-medium text-white/90 transition hover:text-white">
            Turmas
          </Link>
          <Link to="/faq" className="text-sm font-medium text-white/90 transition hover:text-white">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-white/90 transition hover:text-white"
          >
            Entrar
          </Link>
          <Link
            to="/matricula"
            className="rounded-md bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] hover:scale-[1.02]"
          >
            Matricular-se
          </Link>
        </div>
      </nav>

      {/* Slides Container */}
      <div
        className="relative h-full w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false)
          setShowArrows(false)
        }}
        onMouseMove={() => setShowArrows(true)}
      >
        {slides.map((s, index) => {
          const isActive = index === currentSlide
          const isPrev = index === (currentSlide - 1 + slides.length) % slides.length
          const isNext = index === (currentSlide + 1) % slides.length

          return (
            <div
              key={s.id}
              className="absolute inset-0 h-full w-full transition-all duration-[1200ms] ease-in-out"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? 'scale(1)'
                  : direction === 'next' && isPrev
                    ? 'scale(1.05)'
                    : direction === 'prev' && isNext
                      ? 'scale(1.05)'
                      : 'scale(1.1)',
                zIndex: isActive ? 10 : 1,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              {/* Background */}
              <div
                className="absolute inset-0 h-full w-full"
                style={{
                  background: s.background || 'transparent',
                  backgroundImage: s.backgroundImage
                    ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%), url(${s.backgroundImage})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: s.backgroundImage ? 'blur(3px) brightness(0.4)' : 'none'
                }}
              />

              {/* Content */}
              {s.id === 1 ? (
                /* Premium Welcome layout for Slide 1 (THE HUB ACADEMY) */
                <div className="relative z-20 flex h-full w-full items-center justify-center overflow-hidden">
                  {/* Simplified overlay layer */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.95) 100%)'
                    }}
                  />
                  
                  {/* Floating particles */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: '3px',
                        height: '3px',
                        background: 'rgba(201,168,76,0.6)',
                        left: `${10 + (i * 12)}%`,
                        top: `${15 + (i * 8)}%`,
                        animation: `float ${3 + (i * 0.3)}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    />
                  ))}
                  
                  {/* Centered content container */}
                  <div className="relative z-10 mx-auto max-w-[680px] px-6 text-center">
                    {/* Decorative line above */}
                    <div 
                      className="mb-6 animate-fade-in-up"
                      style={{ 
                        height: '1px',
                        width: '200px',
                        background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent)',
                        margin: '0 auto',
                        animationDelay: '0.1s'
                      }}
                    />

                    {/* 1. Eyebrow label with decorative lines */}
                    <div 
                      className="mb-8 flex items-center justify-center gap-3 animate-fade-in-up"
                      style={{ animationDelay: '0.2s' }}
                    >
                      <div 
                        className="h-px w-[30px] bg-[#C9A84C]"
                      />
                      <span className="text-[11px] font-semibold tracking-[5px] text-[#E8C96A] uppercase" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                        ESCOLA DE DUBLAGEM PROFISSIONAL
                      </span>
                      <div 
                        className="h-px w-[30px] bg-[#C9A84C]"
                      />
                    </div>

                    {/* 2. Main title - two lines with effects */}
                    <div 
                      className="mb-6 animate-fade-in-up"
                      style={{ 
                        filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.9))',
                        animationDelay: '0.4s'
                      }}
                    >
                      <h1 className="text-[68px] font-bold leading-[1.05] tracking-[-2px] text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                        Sua Voz Pode
                      </h1>
                      <h1 
                        className="text-[68px] font-bold leading-[1.05] tracking-[-2px]"
                        style={{
                          background: 'linear-gradient(135deg, #E8C96A 0%, #FFFFFF 60%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        Mudar o Mundo
                      </h1>
                    </div>

                    {/* 3. Subtitle */}
                    <p 
                      className="mb-8 max-w-[500px] text-center text-[18px] leading-[1.7] text-white/90 font-normal animate-fade-in-up"
                      style={{ 
                        textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                        animationDelay: '0.6s' 
                      }}
                    >
                      A primeira escola online do Brasil que forma dubladores remotos profissionais e os encaminha ao mercado de trabalho real.
                    </p>

                    {/* 4. Simplified benefits line */}
                    <div 
                      className="mb-8 text-[13px] tracking-[1px] text-white/75 animate-fade-in-up"
                      style={{ 
                        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                        animationDelay: '0.8s' 
                      }}
                    >
                      🎙 Aulas Ao Vivo · <span className="text-[#C9A84C]">·</span> · 8 Alunos Máx · <span className="text-[#C9A84C]">·</span> · Certificado · <span className="text-[#C9A84C]">·</span> · Mercado Real
                    </div>

                    {/* 5. Premium promotion card */}
                    <div 
                      className="relative mb-8 inline-flex items-center gap-2.5 animate-fade-in-up"
                      style={{ 
                        border: '1px solid rgba(201,168,76,0.5)',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '8px',
                        padding: '14px 28px',
                        animationDelay: '1s'
                      }}
                    >
                      <span className="text-[18px] text-[#C9A84C]">🎁</span>
                      <span className="text-[14px] text-white">
                        Ganhe um microfone condensador na sua matrícula
                      </span>
                      <div 
                        className="absolute -top-2 -right-2 rounded-[4px] bg-[rgba(201,168,76,0.2)] px-2 py-0.5"
                      >
                        <span className="text-[10px] font-bold uppercase text-[#C9A84C]">
                          LANÇAMENTO
                        </span>
                      </div>
                    </div>

                    {/* 6. Luxury buttons */}
                    <div 
                      className="mb-8 flex justify-center gap-4 animate-fade-in-up"
                      style={{ animationDelay: '1.2s' }}
                    >
                      <button
                        className="transition-all hover:translate-y-[-2px]"
                        style={{
                          background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                          color: '#0A0A0A',
                          fontWeight: '700',
                          fontSize: '15px',
                          letterSpacing: '1px',
                          padding: '18px 48px',
                          borderRadius: '4px',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 20px 40px rgba(201,168,76,0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        GARANTIR MINHA VAGA →
                      </button>
                      <button
                        className="transition-all hover:bg-white/5"
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.3)',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '15px',
                          padding: '18px 48px',
                          borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                        }}
                      >
                        CONHECER OS CURSOS
                      </button>
                    </div>

                    {/* 7. Trust line */}
                    <p 
                      className="text-[12px] tracking-[2px] text-white/35 animate-fade-in-up"
                      style={{ animationDelay: '1.4s' }}
                    >
                      ✓ Sem fidelidade <span className="text-[#C9A84C]/40">·</span> ✓ Cancele quando quiser <span className="text-[#C9A84C]/40">·</span> ✓ Suporte incluído
                    </p>

                    {/* Decorative line below */}
                    <div 
                      className="mt-6 animate-fade-in-up"
                      style={{ 
                        height: '1px',
                        width: '200px',
                        background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent)',
                        margin: '0 auto',
                        animationDelay: '1.5s'
                      }}
                    />
                  </div>
                </div>
              ) : s.id === 2 ? (
                /* Sales-focused layout for Slide 2 (Ettore Zuim) */
                <div className="relative z-20 flex h-full w-full justify-end">
                  {/* Sales Panel - Right Side (45% width) */}
                  <div
                    className="flex h-full w-[45%] flex-col justify-center overflow-y-auto p-6 md:p-8 lg:p-10"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    <div className="flex flex-col space-y-5">
                      {/* 1. AO VIVO Badge with pulsing red dot */}
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 live-dot" />
                        <span className="text-sm font-bold tracking-wider text-[#C9A84C]">
                          AO VIVO — VAGAS ABERTAS
                        </span>
                      </div>

                      {/* 2. Two-line title */}
                      <div className="space-y-1">
                        <h1 className="text-[40px] font-bold leading-tight text-white md:text-[48px]">
                          Aprenda Dublagem com Ettore Zuim
                        </h1>
                        <h2 className="text-[34px] font-bold italic leading-tight text-[#C9A84C] md:text-[42px]">
                          O Dublador do Batman
                        </h2>
                      </div>

                      {/* Bio paragraph */}
                      <p className="text-[18px] italic leading-relaxed text-[#F5F5F5] line-clamp-3">
                        "Mais de 30 anos emprestando sua voz aos maiores personagens do cinema e da animação mundial. Dublador oficial do Batman, Hércules, Owen Wilson e dezenas de ícones — agora disponível para transformar a sua voz."
                      </p>

                      {/* 3. Gold divider */}
                      <div className="h-px w-full bg-[#C9A84C]/50" />

                      {/* 4. Character badges with hover tooltips */}
                      <div className="flex flex-wrap justify-between gap-2">
                        {[
                          { name: 'Batman', bio: 'O Cavaleiro das Trevas. Herói da DC Comics dublado por Ettore nas animações e filmes da franquia.' },
                          { name: 'Mihawk', bio: 'O maior espadachim do mundo em One Piece. Rival eterno de Zoro e membro dos Shichibukai.' },
                          { name: 'Hércules', bio: 'O filho de Zeus no clássico da Disney de 1997. Um dos personagens mais amados da animação brasileira.' },
                          { name: 'Capitão Frio', bio: 'Leonard Snart, o vilão frio de The Flash. Um dos antagonistas mais carismáticos da DC no streaming.' },
                          { name: 'Owen Wilson', bio: 'Ator americano famoso por Ratatouille, Carros e Apenas Amigos. Voz inconfundível mundialmente.' },
                          { name: 'Heiter', bio: 'O médico perturbador de Frieren. Um dos personagens mais marcantes do anime de 2023.' },
                          { name: 'Shen', bio: 'O vilão misterioso de League of Legends, o ninja das sombras de Ionia.' },
                          { name: 'Príncipe Encantado', bio: 'O príncipe clássico da Disney, presente em Cinderela e Shrek 2.' },
                        ].map((char) => (
                          <div key={char.name} className="group relative">
                            <span className="inline-block rounded border border-[#C9A84C]/40 bg-[#C9A84C]/15 px-2.5 py-1 text-xs font-medium text-[#C9A84C]/90 transition-colors hover:bg-[#C9A84C]/25 cursor-help">
                              {char.name}
                            </span>
                            {/* Tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2 w-[220px] -translate-x-1/2 rounded-[10px] border border-[#C9A84C] p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}>
                              <p className="text-sm leading-snug text-white/90">{char.bio}</p>
                              {/* Tooltip arrow */}
                              <div className="absolute left-1/2 top-full -mt-0.5 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-[#C9A84C]" style={{ backgroundColor: 'rgba(0,0,0,0.92)' }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 6. Divider */}
                      <div className="h-px w-full bg-white/20" />

                      {/* 7. Section title */}
                      <p className="text-xs font-bold tracking-wider text-[#C9A84C]">
                        TURMAS DISPONÍVEIS
                      </p>

                      {/* 8. Premium Course Cards */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Online card */}
                        <div className="min-h-[140px] rounded-xl border border-[#C9A84C]/60 p-6 shadow-xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(201,168,76,0.15)' }}>
                          {/* Premium badge */}
                          <div className="mb-4 flex items-center gap-2">
                            <span className="flex h-3 w-3 rounded-full bg-green-500 live-dot" />
                            <span className="text-sm font-bold text-green-400 tracking-wide">TURMAS ABERTAS</span>
                          </div>
                          <div className="mb-4 flex items-center gap-3">
                            <span className="text-2xl">🌐</span>
                            <h3 className="text-lg font-bold text-white">Online ao Vivo</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-base font-medium text-white">
                              <span className="text-lg">🎁</span>
                              <span>Segunda • 19h às 21h</span>
                            </div>
                            <div className="flex items-center gap-3 text-base font-medium text-white">
                              <span className="text-lg">⚡</span>
                              <span>Terça • 16h às 18h</span>
                            </div>
                            <div className="flex items-center gap-3 text-base font-medium text-white">
                              <span className="text-lg">🕐</span>
                              <span>Terça • 19h às 21h</span>
                            </div>
                            <div className="flex items-center gap-3 text-base font-medium text-white">
                              <span className="text-lg">🎁</span>
                              <span>Sábado • 16h às 18h</span>
                            </div>
                          </div>
                        </div>

                        {/* Presencial card */}
                        <div className="min-h-[140px] rounded-xl border border-[#C9A84C]/60 p-6 shadow-xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(201,168,76,0.15)' }}>
                          {/* Premium badge */}
                          <div className="mb-4 flex items-center gap-2">
                            <span className="flex h-3 w-3 rounded-full bg-green-500 live-dot" />
                            <span className="text-sm font-bold text-green-400 tracking-wide">TURMAS ABERTAS</span>
                          </div>
                          <div className="mb-4 flex items-center gap-3">
                            <span className="text-2xl">📍</span>
                            <h3 className="text-lg font-bold text-white">Presencial São Paulo</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-base font-medium text-white">
                              <span className="text-lg">🕐</span>
                              <span>Sábado • 15h às 17h</span>
                            </div>
                            <div className="flex items-center gap-3 text-base font-medium text-white">
                              <span className="text-lg">⚡</span>
                              <span>Quarta • 19h às 21h</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 9. Premium Urgency Section */}
                      <div className="rounded-xl border border-[#C9A84C]/50 p-4" style={{ 
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)',
                        borderImage: 'linear-gradient(45deg, #C9A84C, rgba(201,168,76,0.3)) 1'
                      }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">⏰</span>
                              <h4 className="text-sm font-bold text-[#C9A84C] tracking-wide">OFERTA POR TEMPO LIMITADO</h4>
                            </div>
                            <p className="text-base font-semibold text-white">
                              ⚡ Apenas <span className="text-red-400 font-bold">4 vagas</span> no valor promocional de início de turma
                            </p>
                            <p className="text-sm text-white/70 mt-1">
                              As inscrições encerram em breve
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#C9A84C] animate-pulse">
                              48h
                            </div>
                            <p className="text-xs text-white/50">
                              restantes
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Promo card */}
                      <div className="rounded-lg border border-[#C9A84C]/60 p-4" style={{ backgroundColor: 'rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center gap-2 text-base font-bold text-[#C9A84C]">
                          <span>🎁</span>
                          GANHE UM MICROFONE CONDENSADOR
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-white/90">
                          Um microfone condensador real, na sua mão, desde a primeira aula. Com ele você já começa a treinar com o equipamento certo — capta sua voz com clareza, elimina ruídos do ambiente e te coloca no modo estúdio toda vez que ligar. Nada de gravar pelo celular ou fone de ouvido. Você chega no primeiro dia de aula com o setup profissional pronto.
                        </p>
                        <p className="mt-3 text-sm font-semibold text-[#C9A84C]">
                          Incluso na matrícula · Enviado para você após a confirmação da matrícula
                        </p>
                        <p className="mt-2 text-xs font-semibold text-red-400">
                          ⚡ Restam apenas 5 unidades disponíveis
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          Para os primeiros alunos confirmados · Sujeito à disponibilidade
                        </p>
                      </div>

                      {/* 10. Age requirement */}
                      <p className="text-xs text-white/50">
                        A partir de 13 anos · Certificado incluso
                      </p>

                      {/* 11. Two buttons */}
                      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <Link
                          to="/matricula"
                          className="shimmer-button inline-flex flex-1 items-center justify-center rounded-lg px-6 py-4 text-sm font-bold text-[#0a0a0a] transition-transform hover:scale-[1.02]"
                        >
                          GARANTIR MINHA VAGA →
                        </Link>
                        <a
                          href="https://wa.me/5511983942763"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#25D366] bg-transparent px-6 py-4 text-sm font-semibold text-[#25D366] transition-all hover:bg-[#25D366]/10 hover:scale-[1.02]"
                        >
                          💬 Falar no WhatsApp
                        </a>
                      </div>

                      {/* 12. Trust text */}
                      <p className="text-center text-xs text-white/40">
                        ✓ Sem fidelidade &nbsp; ✓ Cancele quando quiser &nbsp; ✓ Suporte incluído
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default layout for other slides */
                <div className="relative z-20 flex h-full w-full items-end pb-32 md:pb-40">
                  <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
                    <div
                      className="max-w-3xl space-y-6 transition-all duration-700 ease-out"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: isActive ? '200ms' : '0ms',
                      }}
                    >
                      {/* Badge */}
                      <span
                        className={`inline-block rounded px-3 py-1 text-xs font-semibold tracking-wider ${
                          s.badgeColor === 'gold'
                            ? 'bg-[#C9A84C] text-[#0a0a0a]'
                            : 'bg-[#2563EB] text-white'
                        }`}
                      >
                        {s.badge}
                      </span>

                      {/* Title */}
                      <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                        {s.title}
                      </h1>

                      {/* Subtitle */}
                      <p className="text-lg text-white/80 md:text-xl lg:text-2xl">
                        {s.subtitle}
                      </p>

                      {/* CTA Button */}
                      <div className="pt-4">
                        <Link
                          to={s.ctaLink}
                          className="inline-flex items-center rounded-md bg-[#2563EB] px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-[#1D4ED8] hover:scale-[1.02]"
                        >
                          {s.cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/50 md:left-8"
          style={{
            opacity: showArrows || isPaused ? 1 : 0,
            pointerEvents: showArrows || isPaused ? 'auto' : 'none',
          }}
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/50 md:right-8"
          style={{
            opacity: showArrows || isPaused ? 1 : 0,
            pointerEvents: showArrows || isPaused ? 'auto' : 'none',
          }}
          aria-label="Próximo slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index, index > currentSlide ? 'next' : 'prev')}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-[#2563EB]'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Character Modal */}
        {selectedCharacter && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300"
            onClick={() => setSelectedCharacter(null)}
          >
            <div
              className="relative max-w-sm overflow-hidden rounded-xl border border-[#C9A84C]/60 transition-all duration-300"
              style={{
                backgroundColor: 'rgba(0,0,0,0.95)',
                animation: 'fade-scale-in 0.3s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedCharacter(null)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                ✕
              </button>

              {/* Character image */}
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={selectedCharacter.image}
                  alt={selectedCharacter.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-[#C9A84C]">
                  {selectedCharacter.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {selectedCharacter.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
