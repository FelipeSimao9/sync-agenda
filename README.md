# SYNC 2026 — Companion do evento

App mobile-first do participante do **SYNC 2026 — Conferência Universitária de
Empreendedorismo** (22 de agosto de 2026, 08h00–18h30, iFood HQ, São Paulo).
Mostra o que está acontecendo agora, o que vem a seguir, a agenda do dia e, na
primeira entrada, faz o participante escolher suas trilhas paralelas. Inclui
área de admin para a organização.

Stack: Next.js 15 (App Router, TypeScript) · Supabase (Postgres, acesso 100%
server-side) · Tailwind CSS v4 · framer-motion · Geist · deploy na Vercel.

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e rode o conteúdo de `supabase/schema.sql` inteiro
   (tabelas, view `session_counts` e a função `confirm_registration`).
3. Copie a **URL** do projeto e a **service_role key**
   (Settings → API). A service role nunca vai para o cliente — só é lida em
   Server Actions e Route Handlers.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=      # URL do projeto Supabase
SUPABASE_SERVICE_ROLE_KEY=     # service role key (NUNCA a anon key em produção)
ADMIN_PASSWORD=                # senha do /admin
ALLOW_TIME_OVERRIDE=true       # false em produção; habilita ?now= para testes
```

### 3. Seed das sessões

O conteúdo da agenda vive em `src/data/agenda.ts` (fonte única). Para gravar
as trilhas na tabela `sessions`:

```
npm install
npm run seed
```

O seed é um upsert idempotente — pode rodar quantas vezes quiser.

### 4. Rodar

```
npm run dev        # http://localhost:3000
npm test           # testes da lógica de tempo (estado do evento, regra dos 50%)
npm run build      # build de produção
```

## Testar os estados do dia com `?now=`

Com `ALLOW_TIME_OVERRIDE=true`, `/dia?now=...` substitui o relógio (horário de
São Paulo) e um chip "Horário simulado" aparece no canto. Em produção o
parâmetro é ignorado. Casos úteis:

| URL | O que deve aparecer |
|---|---|
| `/dia?now=2026-08-21T10:00` | pre-event: contagem regressiva em dias |
| `/dia?now=2026-08-22T07:30` | starting-soon: minutos + card do credenciamento |
| `/dia?now=2026-08-22T09:50` | foco no Painel 20, secundário = trilha das 11h |
| `/dia?now=2026-08-22T10:40` | foco = trilha das 11h, secundário = painel |
| `/dia?now=2026-08-22T12:20` | foco no almoço com os 3 pokes |
| `/dia?now=2026-08-22T15:50` | gap: foco no coffee, sem secundário |
| `/dia?now=2026-08-22T18:20` | foco no fechamento, sem secundário |
| `/dia?now=2026-08-22T19:00` | ended: "Até a próxima" |

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure as quatro variáveis de ambiente (com
   `ALLOW_TIME_OVERRIDE=false`).
3. Deploy. Nada mais é necessário — todas as rotas que tocam banco são
   dinâmicas e rodam no servidor.

## Editar agenda e capacidades

- **Horários, títulos, salas, speakers, descrições e cardápios**: edite
  `src/data/agenda.ts`. Blocos `plenary` e `break` não tocam o banco — basta
  redeployar.
- **Capacidade ou salas das trilhas**: edite o bloco `track` em
  `src/data/agenda.ts` e rode `npm run seed` de novo (upsert atualiza
  `capacity`/`room`/`title` sem apagar inscrições).
- **Fotos**: coloque os arquivos em `public/speakers/` (lista completa em
  `public/speakers/README.md`) e `public/brand/`
  (`symbol.png`, `wordmark.png`, `event-photo.png`). Foto ausente cai em
  placeholder — nada quebra.

## Admin

- `/admin/login` — senha de `ADMIN_PASSWORD`, cookie httpOnly assinado.
- `/admin` — totais, ocupação por sessão (barra: lime / âmbar ≥80% / vermelho
  lotado), lista de inscritos por sessão, demandas de acessibilidade e
  exportação CSV (geral em `/admin/export`, por sessão em
  `/admin/export?session=<id>`; UTF-8 com BOM, abre com acentos corretos no
  Excel). Atualiza sozinho a cada 30s.

## Estrutura

```
src/app/            rotas (/, /entrar, /escolher, /dia, /admin, APIs)
src/data/agenda.ts  fonte única do conteúdo da agenda
src/lib/time.ts     estado do evento, regra dos 50%, timezone (testado)
src/lib/ics.ts      geração do .ics com VTIMEZONE America/Sao_Paulo
src/components/     LivingBackground, TrackCard, NowScreen, AgendaList, …
supabase/schema.sql tabelas + view + RPC confirm_registration
scripts/seed.ts     upsert das trilhas em `sessions`
```
