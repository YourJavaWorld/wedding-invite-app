create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  guests integer not null default 1,
  children_count integer not null default 0,
  vegetarian_meals integer not null default 0,
  allergies text not null default '',
  stay_option text not null default 'none',
  transport_departure text,
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guests_children_count_check check (children_count >= 0 and children_count <= guests),
  constraint guests_vegetarian_meals_check check (vegetarian_meals >= 0 and vegetarian_meals <= guests),
  constraint guests_stay_option_check check (stay_option in ('none', 'accommodation', 'transport')),
  constraint guests_transport_departure_check check (
    (stay_option = 'transport' and transport_departure is not null and transport_departure in ('Casimcea', 'Piatra Neamț'))
    or (stay_option <> 'transport' and transport_departure is null)
  )
);

alter table public.guests alter column email drop not null;
alter table public.guests add column if not exists children_count integer not null default 0;
alter table public.guests add column if not exists vegetarian_meals integer not null default 0;
alter table public.guests add column if not exists allergies text not null default '';
alter table public.guests add column if not exists stay_option text not null default 'none';
alter table public.guests add column if not exists transport_departure text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'guests_children_count_check' and conrelid = 'public.guests'::regclass) then
    alter table public.guests add constraint guests_children_count_check
      check (children_count >= 0 and children_count <= guests);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'guests_vegetarian_meals_check' and conrelid = 'public.guests'::regclass) then
    alter table public.guests add constraint guests_vegetarian_meals_check
      check (vegetarian_meals >= 0 and vegetarian_meals <= guests);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'guests_stay_option_check' and conrelid = 'public.guests'::regclass) then
    alter table public.guests add constraint guests_stay_option_check
      check (stay_option in ('none', 'accommodation', 'transport'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'guests_transport_departure_check' and conrelid = 'public.guests'::regclass) then
    alter table public.guests add constraint guests_transport_departure_check check (
      (stay_option = 'transport' and transport_departure is not null and transport_departure in ('Casimcea', 'Piatra Neamț'))
      or (stay_option <> 'transport' and transport_departure is null)
    );
  end if;
end $$;

create index if not exists guests_email_idx on guests (email);
create index if not exists guests_status_idx on guests (status);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on guests;
create trigger set_updated_at
before update on guests
for each row
execute function update_updated_at_column();
