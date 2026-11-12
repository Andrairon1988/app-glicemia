-- =====================================================================
-- App Glicemia — estrutura inicial do banco (Fase 1)
-- Como aplicar: Supabase -> SQL Editor -> New query -> colar tudo -> Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- Momento da medição (jejum, antes/depois das refeições etc.)
-- ---------------------------------------------------------------------
create type public.momento_medicao as enum (
  'jejum',
  'antes_cafe',
  'depois_cafe',
  'antes_almoco',
  'depois_almoco',
  'antes_jantar',
  'depois_jantar',
  'antes_dormir',
  'madrugada',
  'outro'
);

-- ---------------------------------------------------------------------
-- Perfil: um por usuário (uma conta = um paciente)
-- ---------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  nome_paciente     text check (char_length(nome_paciente) <= 100),
  termos_aceitos_em timestamptz,
  criado_em         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Faixas-alvo (limites em mg/dL), editáveis pelo usuário.
-- Regra de classificação de um valor V:
--   V <  limite_hipo_grave            -> hipoglicemia grave
--   V <  limite_hipo                  -> hipoglicemia
--   V <= limite_hiper                 -> na meta
--   V <= limite_hiper_grave           -> hiperglicemia
--   V >  limite_hiper_grave           -> hiperglicemia grave
-- Padrões (SBD): 54 / 70 / 180 / 250
-- ---------------------------------------------------------------------
create table public.faixas_alvo (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  limite_hipo_grave   smallint not null default 54,
  limite_hipo         smallint not null default 70,
  limite_hiper        smallint not null default 180,
  limite_hiper_grave  smallint not null default 250,
  atualizado_em       timestamptz not null default now(),
  constraint faixas_em_ordem check (
    20 <= limite_hipo_grave
    and limite_hipo_grave < limite_hipo
    and limite_hipo < limite_hiper
    and limite_hiper < limite_hiper_grave
    and limite_hiper_grave <= 600
  )
);

-- ---------------------------------------------------------------------
-- Medições de glicemia
-- ---------------------------------------------------------------------
create table public.medicoes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  valor_mg_dl    smallint not null check (valor_mg_dl between 20 and 600),
  medido_em      timestamptz not null default now(),
  momento        public.momento_medicao not null,
  medicamento    text check (char_length(medicamento) <= 100),
  dose           text check (char_length(dose) <= 50),
  observacao     text check (char_length(observacao) <= 500),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index medicoes_user_data_idx on public.medicoes (user_id, medido_em desc);

-- ---------------------------------------------------------------------
-- Atualiza "atualizado_em" automaticamente
-- ---------------------------------------------------------------------
create function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger medicoes_atualizado_em
  before update on public.medicoes
  for each row execute function public.definir_atualizado_em();

create trigger faixas_alvo_atualizado_em
  before update on public.faixas_alvo
  for each row execute function public.definir_atualizado_em();

-- ---------------------------------------------------------------------
-- Ao criar um usuário (primeiro login com Google), cria o perfil e as
-- faixas-alvo padrão automaticamente.
-- ---------------------------------------------------------------------
create function public.criar_dados_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome_paciente)
  values (new.id, left(new.raw_user_meta_data ->> 'full_name', 100));

  insert into public.faixas_alvo (user_id) values (new.id);

  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_dados_novo_usuario();

-- Caso algum usuário já exista antes deste script
insert into public.profiles (id, nome_paciente)
select id, left(raw_user_meta_data ->> 'full_name', 100) from auth.users
on conflict (id) do nothing;

insert into public.faixas_alvo (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------
-- Segurança: Row Level Security (cada usuário só vê os próprios dados)
-- ---------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.faixas_alvo enable row level security;
alter table public.medicoes    enable row level security;

-- Perfil: ler e alterar só o próprio (criação é feita pelo trigger)
create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "perfil: alterar o próprio" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Faixas: ler e alterar só as próprias
create policy "faixas: ler as próprias" on public.faixas_alvo
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "faixas: alterar as próprias" on public.faixas_alvo
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Medições: CRUD só das próprias
create policy "medicoes: ler as próprias" on public.medicoes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "medicoes: criar as próprias" on public.medicoes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "medicoes: alterar as próprias" on public.medicoes
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "medicoes: excluir as próprias" on public.medicoes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Permissões de acesso pela API (somente usuários logados)
grant usage on schema public to authenticated;
grant usage on type public.momento_medicao to authenticated;
grant select, update                 on public.profiles    to authenticated;
grant select, update                 on public.faixas_alvo to authenticated;
grant select, insert, update, delete on public.medicoes    to authenticated;
revoke all on public.profiles, public.faixas_alvo, public.medicoes from anon;
