# Mapa Fácil

Workspace visual de estratégia e mapas mentais, 100% HTML/CSS/JS puro e sem etapa de build.

Repositório oficial: [miguelsantana1337/mapafacil](https://github.com/miguelsantana1337/mapafacil).

## Desenvolvimento com Codex e Claude

As regras compartilhadas do projeto ficam em `AGENTS.md`. O `CLAUDE.md` importa essas mesmas instruções, evitando que os dois agentes adotem convenções diferentes.

Fluxo recomendado:

1. Use `main` como base estável.
2. Crie uma branch por tarefa ou agente.
3. Execute `npm run build` após alterar os arquivos-fonte.
4. Execute `npm run check` antes de publicar a branch.
5. Integre mudanças em `main` por pull request.

## Recursos implementados

- Dashboard com mapas recentes, favoritos, coleções e modelos
- Editor visual com tópicos, subtópicos, tópicos irmãos e tópicos flutuantes
- Arrastar, zoom, navegação no canvas, minimapa e recolhimento de ramos
- Conexões hierárquicas e conexões transversais entre tópicos
- Visão de mapa e visão em tópicos sincronizadas
- Notas, links, responsável, prazo, conclusão e comentários por tópico
- Histórico local com desfazer/refazer
- Favoritos, tema claro/escuro, apresentação em tela cheia
- Importação e exportação do mapa em JSON
- Persistência automática no navegador
- Interface responsiva para desktop e celular

## Sincronização com Supabase

O aplicativo usa armazenamento local por padrão e ativa a sincronização quando
`SUPABASE_URL` e `SUPABASE_ANON_KEY` estão configuradas no build. O schema seguro
está em `supabase/migrations/202609110001_create_mind_maps.sql` e aplica RLS para
que cada usuário acesse somente os próprios mapas.

Depois de aplicar a migração e configurar as duas variáveis na hospedagem, o
usuário pode entrar por link mágico de e-mail e migrar seus mapas locais para a
conta. Nunca use a chave `service_role` no frontend.

## Rodar localmente

```bash
npm run dev
```

Abra `http://localhost:8743`.

## Validar e preparar a publicação

```bash
npm run build
npm run check
```

O build apenas sincroniza `index.html`, `styles.css`, `storage.js` e `app.js` com `dist/`. A validação confere a sintaxe JavaScript e garante que o artefato publicado não divergiu dos fontes.

## Arquitetura de dados (pronta para Supabase)

Toda a persistência passa por `storage.js`, que expõe `window.MindStorage` com:

- `listMaps()` — lista `{id, title, updatedAt}` de todos os mapas
- `loadMap(id)` — carrega um mapa completo `{id, title, nodes, rootId, updatedAt}`
- `saveMap(map)` — cria/atualiza um mapa
- `deleteMap(id)` — remove um mapa
- `getLastOpenedId()` / `setLastOpenedId(id)` — último mapa aberto

`app.js` só chama esses métodos — nunca acessa `localStorage` diretamente. A implementação atual (`localAdapter` em `storage.js`) guarda tudo no `localStorage` do navegador.

### Para plugar o Supabase

1. Crie uma tabela `maps`:
   ```sql
   create table maps (
     id text primary key,
     user_id uuid references auth.users default auth.uid(),
     title text,
     data jsonb,
     updated_at timestamptz default now()
   );
   alter table maps enable row level security;
   create policy "own maps" on maps for all using (auth.uid() = user_id);
   ```
2. Adicione o SDK `@supabase/supabase-js` (via `<script>` do CDN ou bundler).
3. Escreva um segundo adapter no mesmo arquivo (ou em `storage.supabase.js`) com as mesmas 6 funções, mas lendo/gravando na tabela `maps` (guarde `nodes`/`rootId`/`title` dentro da coluna `data jsonb`).
4. No final do arquivo, troque `window.MindStorage = localAdapter;` pelo novo adapter — nada em `app.js` precisa mudar.
5. Adicione login (Supabase Auth) para popular `user_id` e ter mapas por usuário/multi-dispositivo.

## Publicar online

Como é estático (sem servidor/backend próprio), qualquer host estático serve: Vercel, Netlify, GitHub Pages, Cloudflare Pages. Basta apontar para a pasta raiz (contém `index.html`, `app.js`, `storage.js`, `styles.css`).

## Correção recente

O bug de "editar o balão" era o botão de colapsar (`− / +`) ficando dentro da área `contentEditable`, vazando seu símbolo para o texto salvo. Agora só o texto (`.node-text`) vira editável — o botão fica fora.
