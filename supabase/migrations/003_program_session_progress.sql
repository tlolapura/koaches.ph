-- Program progress (sessions_completed) should only count done program sessions
-- for the student's current program — not drop-ins.

create or replace function sync_sessions_completed_on_done()
returns trigger as $$
begin
  if new.status = 'done' and (old.status is distinct from 'done') then
    if new.program_id is not null and new.type = 'program' then
      insert into program_enrollments (program_id, student_id)
      values (new.program_id, new.student_id)
      on conflict do nothing;
    end if;
  end if;

  if new.type = 'program'
     and new.program_id is not null
     and new.status is distinct from old.status then
    update students
    set sessions_completed = (
      select count(*)::int
      from sessions s
      where s.student_id = students.id
        and s.program_id = students.program_id
        and s.type = 'program'
        and s.status = 'done'
    ),
    updated_at = now()
    where id = new.student_id
      and program_id = new.program_id;
  end if;

  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Backfill: drop-ins inflated counts for students on a program
update students s
set sessions_completed = coalesce((
  select count(*)::int
  from sessions sess
  where sess.student_id = s.id
    and sess.program_id = s.program_id
    and sess.type = 'program'
    and sess.status = 'done'
), 0),
updated_at = now()
where s.program_id is not null;
