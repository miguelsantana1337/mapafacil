# AGENTS.md

Este arquivo define as regras compartilhadas para qualquer agente que trabalhe neste repositório.

## Fonte de verdade

- O repositório oficial é `https://github.com/miguelsantana1337/mapafacil`.
- A branch `main` deve permanecer estável e pronta para publicação.
- Trabalhe em branch própria para mudanças não triviais e use pull request antes de integrar em `main`.
- Antes de editar, leia `README.md`, confira `git status` e preserve mudanças que não pertencem à tarefa atual.
- Nunca invente requisitos de produto, integrações, credenciais ou dados comerciais. Registre dúvidas e mantenha estados seguros quando faltar informação.

## Arquitetura atual

- SaaS em Next.js App Router, React, TypeScript e Tailwind CSS.
- Canvas em `@xyflow/react`, estado em Zustand e validação com Zod.
- Backend Supabase com Auth, PostgreSQL, RLS e Storage privado.
- O produto é pessoal no MVP. A estrutura de workspace existe no banco, mas não exponha colaboração ou membros sem nova decisão explícita.
- O modo Funnel desenha jornadas comerciais visualmente; não é CRM e não armazena leads ou oportunidades.
- Nodes semânticos são sugestões editáveis. Preserve o bloco personalizado e a liberdade estrutural do canvas.
- A aplicação estática anterior foi preservada em `legacy-static/` apenas como referência e recuperação.
- A marca oficial é Mapa Fácil. Use os arquivos fornecidos em `public/assets/`; não redesenhe o símbolo ou o wordmark.

## Comandos

- Servidor local: `npm run dev`
- Lint: `npm run lint`
- TypeScript: `npm run typecheck`
- Testes: `npm run test`
- Build: `npm run build`
- Validação completa: `npm run check`

Execute `npm run check` antes de concluir qualquer alteração.

## Convenções de implementação

- Preserve a interface em português do Brasil e o comportamento responsivo.
- Prefira alterações pequenas, legíveis e sem dependências novas quando a plataforma nativa for suficiente.
- Não coloque chaves, tokens, senhas ou dados pessoais no código, em commits, logs ou documentação.
- Variáveis públicas e segredos futuros devem ser documentados em `.env.example`, nunca em `.env` versionado.
- Ao mudar interações visuais, valide a aplicação no navegador em desktop e celular.
- Não afirme que uma integração, deploy ou persistência remota funciona sem uma verificação real do ambiente correspondente.

## Git e entrega

- Use mensagens de commit claras e focadas.
- Não reescreva histórico compartilhado nem use comandos destrutivos para descartar trabalho.
- Revise `git diff`, execute `git diff --check` e rode `npm run check` antes de commit ou pull request.
- Não faça push direto em `main` durante trabalho paralelo entre agentes; publique a branch e integre por pull request.

## Code Review Rules

- Bloqueie mudanças que exponham segredos ou dados pessoais.
- Bloqueie tabelas públicas sem grants, RLS e testes de autorização.
- Sinalize acesso ao Supabase que dependa somente de verificações do frontend.
- Sinalize funcionalidades sem estados de erro, vazio ou carregamento quando esses estados forem aplicáveis.
- Exija validação responsiva para alterações de interface.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
