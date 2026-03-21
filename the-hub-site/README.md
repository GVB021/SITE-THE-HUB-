<<<<<<< HEAD
# SITE-THE-HUB-
=======
# THE HUB — Plataforma de cursos de dublagem

Aplicação completa feita com React + Vite + Tailwind para apresentar a escola, coletar matrículas, liberar o painel do aluno e oferecer um dashboard administrativo com dados simulados prontos para integração real (Supabase + Mercado Pago).

## Tecnologias

- React + Vite + TypeScript
- Tailwind CSS com tema customizado
- React Router para rotas públicas e privadas
- Zustand para estado de autenticação
- Supabase client pronto para configuração por `.env`

## Estrutura de pastas

```
src/
├── components/ (UI e blocos reutilizáveis)
├── data/mocks.ts (dados simulados para dashboards)
├── layouts/ (MainLayout e DashboardLayout)
├── pages/
│   ├── Landing
│   ├── Enrollment
│   ├── Auth
│   ├── Student
│   └── Admin
├── store/ (Zustand auth store)
├── lib/supabaseClient.ts
└── types/
```

## Como rodar

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha quando tiver as chaves reais.

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_MERCADO_PAGO_PUBLIC_KEY=...
```

Enquanto não houver integrações reais, o app usa mocks e simulações.

## Fluxos

- **Landing Page**: hero, benefícios, professores, plano de preço e FAQ.
- **Matrícula**: formulário + resumo do pedido com botão simulado do Mercado Pago.
- **Login + Painel do Aluno**: credenciais de teste `aluno@thehub.com` (qualquer senha) exibem turma, professor, próxima aula e pagamentos.
- **Painel Admin (/admin)**: mostra métricas, listas de alunos, vendedores, mensagens e comissões usando dados mockados.

## Próximos passos sugeridos

1. Conectar Supabase nos hooks de autenticação e persistência dos dados.
2. Integrar o checkout real do Mercado Pago e registrar transações.
3. Substituir os mock data por queries/REST do backend definitivo.
>>>>>>> 7325d46c (Commit inicial do app de dublagem)
