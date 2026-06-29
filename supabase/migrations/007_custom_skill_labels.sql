-- Coach drop-in skill customization + per-coach/program label overrides

alter table coaches
  add column if not exists custom_skill_ids text[],
  add column if not exists skill_label_overrides jsonb not null default '{}';

alter table programs
  add column if not exists skill_label_overrides jsonb not null default '{}';
