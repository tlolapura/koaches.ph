-- Optional tip on top of session price (PHP, whole pesos)
alter table sessions
  add column if not exists tip integer not null default 0;

alter table sessions
  drop constraint if exists sessions_tip_non_negative;

alter table sessions
  add constraint sessions_tip_non_negative check (tip >= 0);
