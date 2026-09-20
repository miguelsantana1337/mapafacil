# Mapa Fácil — decisões consolidadas do SPEC DRIVER 1.1

## Produto

O Mapa Fácil é um Visual Strategy Builder para mapas mentais e jornadas comerciais.

O modo Funnel é um construtor visual totalmente editável. Ele permite desenhar aquisição, páginas, relacionamento, processos comerciais, venda e pós-venda. Não é CRM, não gerencia leads e não executa automações.

## Liberdade criativa

- Não existe ordem obrigatória de etapas.
- Qualquer bloco pode ser conectado a qualquer outro.
- Condições possuem saídas nomeáveis e permitem ramificações.
- Nodes semânticos oferecem campos opcionais, nunca uma estrutura obrigatória.
- O bloco personalizado representa qualquer etapa não prevista pela biblioteca.
- Templates são pontos de partida completamente destravados.
- Título, descrição, propriedades, cor, posição e conexões são editáveis.

## MVP pessoal

O banco nasce com `workspace`, memberships e roles para não bloquear a evolução futura. A interface inicial cria e utiliza somente o workspace pessoal. Gestão de membros, presença, comentários colaborativos e multiplayer ficam fora do MVP.

## Fora do escopo

- cadastro e gestão de leads, contatos ou oportunidades;
- previsão de receita e pipeline comercial operacional;
- disparos de WhatsApp ou e-mail;
- execução de automações;
- conversões alimentadas por dados reais;
- sincronização com CRMs externos;
- billing e IA.

## Segurança

- Toda mudança de banco é migration versionada.
- Tabelas expostas exigem grants mínimos e RLS por operação.
- Identidade deriva de `auth.uid()`.
- Funções `security definer` ficam em schema privado, com `search_path=''` e execução restrita.
- O bucket de assets é privado e validado por membership.
- Preview e Production não compartilham banco.

## Migração

A versão estática anterior permanece em `legacy-static/` enquanto o SaaS é homologado. Dados históricos em `mind_maps` não devem ser apagados; a migração de conteúdo será feita por importador idempotente antes da retirada definitiva do legado.
