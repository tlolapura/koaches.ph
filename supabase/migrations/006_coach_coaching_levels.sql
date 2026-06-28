-- Player levels each coach works with (multi-select; maps to default drop-in rubric)

alter table coaches
  add column if not exists coaching_levels text[] not null default '{}';

update coaches
set coaching_levels = array[skill_template_id]::text[]
where skill_template_id in ('beginner', 'intermediate', 'advanced')
  and coaching_levels = '{}';
