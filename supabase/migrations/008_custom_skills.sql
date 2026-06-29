-- Coach/program-owned custom skills (added per category, outside the default catalog)

alter table coaches
  add column if not exists custom_skills jsonb not null default '[]';

alter table programs
  add column if not exists custom_skills jsonb not null default '[]';
