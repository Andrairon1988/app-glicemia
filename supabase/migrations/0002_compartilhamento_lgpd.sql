-- =====================================================================
-- App Glicemia — Fase 3: links para familiares + exclusão de conta
-- Como aplicar: Supabase -> SQL Editor -> New query -> colar tudo -> Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- Links de compartilhamento (somente leitura), um por pessoa
-- ---------------------------------------------------------------------
create table public.links_compartilhamento (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome              text not null check (char_length(nome) between 1 and 60),
  token             text not null unique check (char_length(token) >= 32),
  expira_em         timestamptz,            -- null = sem validade
  revogado_em       timestamptz,            -- preenchido quando o dono desativa
  ultimo_acesso_em  timestamptz,
  criado_em         timestamptz not null default now()
);

create index links_compartilhamento_user_idx on public.links_compartilhamento (user_id, criado_em desc);

alter table public.links_compartilhamento enable row level security;

-- O dono vê, cria, desativa e exclui apenas os próprios links
create policy "links: ler os próprios" on public.links_compartilhamento
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "links: criar os próprios" on public.links_compartilhamento
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "links: alterar os próprios" on public.links_compartilhamento
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "links: excluir os próprios" on public.links_compartilhamento
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.links_compartilhamento to authenticated;
revoke all on public.links_compartilhamento from anon;

-- ---------------------------------------------------------------------
-- Leitura pública por link: devolve os dados SOMENTE se o token for
-- válido (existe, não expirou, não foi desativado). Nunca devolve as
-- observações. Máximo de 90 dias de medições.
-- ---------------------------------------------------------------------
create function public.dados_compartilhados(p_token text, p_dias int default 14)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link public.links_compartilhamento%rowtype;
  v_dias int := least(greatest(coalesce(p_dias, 14), 1), 90);
  v_resultado json;
begin
  select * into v_link
  from public.links_compartilhamento
  where token = p_token
    and revogado_em is null
    and (expira_em is null or expira_em > now());

  if not found then
    return null;
  end if;

  update public.links_compartilhamento
  set ultimo_acesso_em = now()
  where id = v_link.id;

  select json_build_object(
    'nome_link', v_link.nome,
    'expira_em', v_link.expira_em,
    'nome_paciente', (select p.nome_paciente from public.profiles p where p.id = v_link.user_id),
    'faixas', (
      select json_build_object(
        'limite_hipo_grave', f.limite_hipo_grave,
        'limite_hipo', f.limite_hipo,
        'limite_hiper', f.limite_hiper,
        'limite_hiper_grave', f.limite_hiper_grave)
      from public.faixas_alvo f where f.user_id = v_link.user_id
    ),
    'medicoes', coalesce((
      select json_agg(json_build_object(
        'id', m.id,
        'valor_mg_dl', m.valor_mg_dl,
        'medido_em', m.medido_em,
        'momento', m.momento,
        'medicamento', m.medicamento,
        'dose', m.dose
      ) order by m.medido_em)
      from public.medicoes m
      where m.user_id = v_link.user_id
        and m.medido_em >= (date_trunc('day', now() at time zone 'America/Sao_Paulo')
                            - make_interval(days => v_dias - 1)) at time zone 'America/Sao_Paulo'
    ), '[]'::json)
  ) into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.dados_compartilhados(text, int) from public;
grant execute on function public.dados_compartilhados(text, int) to anon, authenticated;

-- ---------------------------------------------------------------------
-- LGPD: o usuário logado exclui a PRÓPRIA conta. As medições, faixas,
-- perfil e links são apagados juntos (on delete cascade).
-- ---------------------------------------------------------------------
create function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
