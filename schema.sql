create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  guests integer not null default 1,
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
