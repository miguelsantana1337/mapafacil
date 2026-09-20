# Mapa Fácil

Visual Strategy Builder para transformar ideias, processos e jornadas comerciais em mapas visuais claros.

O modo **Funnel** é um construtor visual totalmente editável. Ele documenta a estrutura de aquisição, relacionamento, venda e pós-venda, mas não é um CRM e não gerencia leads ou oportunidades.

## Stack

- Next.js App Router, React e TypeScript
- Tailwind CSS
- React Flow (`@xyflow/react`)
- Zustand e Zod
- Supabase Auth, PostgreSQL, RLS e Storage
- Vercel

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

A aplicação abre em `http://localhost:3000`. O canvas demonstrativo está disponível em `/app/projects/demo` mesmo sem Supabase configurado.

## Variáveis

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Não use chaves secretas com prefixo `NEXT_PUBLIC_`. Uma chave secreta server-side só deve ser adicionada quando houver uma operação administrativa concreta que a exija.

## Banco

As migrations ficam em `supabase/migrations/`. A migration SaaS cria:

- profiles e workspace pessoal automático;
- projects, project_nodes e project_edges;
- templates, versões e assets;
- grants mínimos, RLS e funções privadas de autorização;
- bucket privado `project-assets` com policies por workspace.

Aplicar somente no ambiente correto:

```bash
npx supabase db push
```

Não use uma Preview Deployment contra o banco de produção.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Ou execute tudo:

```bash
npm run check
```

## Estrutura

- `src/app/` — rotas públicas, autenticação e área privada
- `src/components/editor/` — canvas, biblioteca e propriedades
- `src/features/editor/` — registry, templates e validação
- `src/features/projects/` — criação, carregamento e autosave
- `src/lib/supabase/` — clientes browser/server e renovação de sessão
- `src/stores/` — estado do editor e undo/redo
- `supabase/` — migrations e seed
- `legacy-static/` — versão anterior preservada para referência

## Fluxo Git

`main` é produção. Mudanças entram por branch e pull request, com Preview Deployment e CI antes do merge.
