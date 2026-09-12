# AGENTS.md

Este arquivo define as regras compartilhadas para qualquer agente que trabalhe neste repositório.

## Fonte de verdade

- O repositório oficial é `https://github.com/miguelsantana1337/mapafacil`.
- A branch `main` deve permanecer estável e pronta para publicação.
- Trabalhe em branch própria para mudanças não triviais e use pull request antes de integrar em `main`.
- Antes de editar, leia `README.md`, confira `git status` e preserve mudanças que não pertencem à tarefa atual.
- Nunca invente requisitos de produto, integrações, credenciais ou dados comerciais. Registre dúvidas e mantenha estados seguros quando faltar informação.

## Arquitetura atual

- Aplicação estática em HTML, CSS e JavaScript puro, sem dependências de produção.
- Arquivos-fonte: `index.html`, `styles.css`, `storage.js` e `app.js`.
- Artefato publicado: `dist/`, que deve ser uma cópia exata dos quatro arquivos-fonte.
- Persistência atual: `localStorage`, isolada atrás de `window.MindStorage` em `storage.js`.
- A experiência atual é pessoal e individual. Não exponha recursos de reunião, equipe ou colaboração sem nova decisão explícita do produto.
- A marca oficial é Mapa Fácil. Use os arquivos fornecidos em `assets/`; não redesenhe nem aproxime o símbolo ou o wordmark.
- Não acesse `localStorage` diretamente em `app.js`; mantenha a abstração de armazenamento.

## Comandos

- Servidor local: `npm run dev`
- Validação completa: `npm run check`
- Sincronizar o artefato de publicação: `npm run build`

Execute `npm run check` antes de concluir qualquer alteração. Se mudar um arquivo-fonte, execute `npm run build` antes do check e inclua a atualização correspondente em `dist/`.

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
- Bloqueie divergência entre os arquivos-fonte e `dist/`.
- Sinalize acesso direto ao `localStorage` fora de `storage.js`.
- Sinalize funcionalidades sem estados de erro, vazio ou carregamento quando esses estados forem aplicáveis.
- Exija validação responsiva para alterações de interface.
