-- SYNC 2026 — schema. Rode este arquivo inteiro no SQL Editor do Supabase.

create table if not exists sessions (
  id text primary key,
  slot smallint not null check (slot in (1, 2)),
  title text not null,
  room text not null,
  capacity integer not null check (capacity > 0),
  sort_order smallint not null
);

create table if not exists participants (
  email text primary key,
  first_name text not null,
  last_name text not null,
  accessibility_needs text,
  created_at timestamptz not null default now()
);

create table if not exists registrations (
  id bigserial primary key,
  email text not null references participants(email) on delete cascade,
  session_id text not null references sessions(id),
  slot smallint not null,
  created_at timestamptz not null default now(),
  unique (email, slot)
);

create index if not exists registrations_session_id_idx on registrations(session_id);

create or replace view session_counts as
  select s.id as session_id,
         s.slot,
         s.capacity,
         count(r.id)::int as registered,
         greatest(s.capacity - count(r.id), 0)::int as remaining
    from sessions s
    left join registrations r on r.session_id = s.id
   group by s.id;

-- Confirmação atômica: participante + até 2 inscrições em uma transação.
-- Slots null significam "não vou participar" e são válidos.
create or replace function confirm_registration(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_accessibility text,
  p_session_slot1 text,
  p_session_slot2 text
) returns jsonb
language plpgsql
as $$
declare
  v_email text := lower(trim(p_email));
  v_session record;
  v_count integer;
begin
  if exists (select 1 from participants where email = v_email) then
    return jsonb_build_object('ok', false, 'reason', 'already_registered');
  end if;

  -- trava as sessões pedidas, em ordem de id para evitar deadlock
  for v_session in
    select * from sessions
     where id in (p_session_slot1, p_session_slot2)
     order by id
     for update
  loop
    null;
  end loop;

  if p_session_slot1 is not null then
    select * into v_session from sessions where id = p_session_slot1;
    if not found or v_session.slot <> 1 then
      return jsonb_build_object('ok', false, 'reason', 'invalid_session', 'slot', 1);
    end if;
    select count(*) into v_count from registrations where session_id = p_session_slot1;
    if v_count >= v_session.capacity then
      return jsonb_build_object('ok', false, 'reason', 'full', 'slot', 1);
    end if;
  end if;

  if p_session_slot2 is not null then
    select * into v_session from sessions where id = p_session_slot2;
    if not found or v_session.slot <> 2 then
      return jsonb_build_object('ok', false, 'reason', 'invalid_session', 'slot', 2);
    end if;
    select count(*) into v_count from registrations where session_id = p_session_slot2;
    if v_count >= v_session.capacity then
      return jsonb_build_object('ok', false, 'reason', 'full', 'slot', 2);
    end if;
  end if;

  insert into participants (email, first_name, last_name, accessibility_needs)
  values (v_email, trim(p_first_name), trim(p_last_name), nullif(trim(p_accessibility), ''));

  if p_session_slot1 is not null then
    insert into registrations (email, session_id, slot) values (v_email, p_session_slot1, 1);
  end if;
  if p_session_slot2 is not null then
    insert into registrations (email, session_id, slot) values (v_email, p_session_slot2, 2);
  end if;

  return jsonb_build_object('ok', true);
end;
$$;
