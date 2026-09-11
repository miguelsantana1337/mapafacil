# Como contribuir

## Fluxo recomendado

1. Atualize sua cópia a partir de `main`.
2. Crie uma branch curta e descritiva, como `feat/exportar-pdf` ou `fix/editor-mobile`.
3. Faça mudanças focadas e mantenha os arquivos de `dist/` sincronizados com os fontes.
4. Execute `npm run build` e `npm run check`.
5. Revise `git diff` e abra um pull request para `main`.

## Trabalho com Codex e Claude

- Ambos devem seguir as regras centrais de `AGENTS.md`.
- Evite dois agentes editando a mesma branch ou os mesmos arquivos simultaneamente.
- Dê uma branch separada a cada tarefa/agente e integre o resultado por pull request.
- Antes de começar uma tarefa, sincronize a branch base para reduzir conflitos.
- Nunca compartilhe segredos em prompts, arquivos rastreados ou mensagens de commit.

## Critério mínimo de conclusão

- A funcionalidade solicitada está implementada no escopo combinado.
- `npm run check` termina sem erros.
- Mudanças visuais foram verificadas no navegador e em largura móvel quando aplicável.
- README e instruções foram atualizados se o comportamento ou o setup mudou.
