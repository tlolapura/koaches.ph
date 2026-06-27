-- Split person names into first_name + last_name (keep name as display full name)

alter table coaches
  add column if not exists first_name text,
  add column if not exists last_name text not null default '';

alter table students
  add column if not exists first_name text,
  add column if not exists last_name text not null default '';

-- Backfill coaches (strip optional "Coach " prefix from legacy names)
update coaches
set
  first_name = split_part(trim(regexp_replace(name, '^Coach\s+', '', 'i')), ' ', 1),
  last_name = coalesce(
    nullif(
      trim(
        substring(
          trim(regexp_replace(name, '^Coach\s+', '', 'i'))
          from length(split_part(trim(regexp_replace(name, '^Coach\s+', '', 'i')), ' ', 1)) + 2
        )
      ),
      ''
    ),
    ''
  )
where first_name is null or first_name = '';

update coaches
set first_name = coalesce(nullif(first_name, ''), name)
where first_name is null or first_name = '';

alter table coaches
  alter column first_name set not null;

-- Backfill students
update students
set
  first_name = split_part(trim(name), ' ', 1),
  last_name = coalesce(
    nullif(
      trim(substring(trim(name) from length(split_part(trim(name), ' ', 1)) + 2)),
      ''
    ),
    ''
  )
where first_name is null or first_name = '';

update students
set first_name = coalesce(nullif(first_name, ''), name)
where first_name is null or first_name = '';

alter table students
  alter column first_name set not null;
