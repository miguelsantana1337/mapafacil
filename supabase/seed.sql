insert into public.templates(id,name,description,project_type,scope,snapshot,is_published)
values
  ('10000000-0000-4000-8000-000000000001','Mapa em branco','Comece somente com uma ideia central.','mindmap','system','{"format":"mapafacil","version":1,"nodes":[],"edges":[]}'::jsonb,true),
  ('10000000-0000-4000-8000-000000000002','Funil em branco','Canvas livre para desenhar qualquer jornada.','funnel','system','{"format":"mapafacil","version":1,"nodes":[],"edges":[]}'::jsonb,true),
  ('10000000-0000-4000-8000-000000000003','Meta Ads para WhatsApp','Aquisição, conversa e venda.','funnel','system','{"format":"mapafacil","version":1,"nodes":[],"edges":[]}'::jsonb,true),
  ('10000000-0000-4000-8000-000000000004','Funil de consultoria','Da campanha à proposta e venda.','funnel','system','{"format":"mapafacil","version":1,"nodes":[],"edges":[]}'::jsonb,true)
on conflict(id) do update set name=excluded.name,description=excluded.description,snapshot=excluded.snapshot,is_published=excluded.is_published,updated_at=now();
