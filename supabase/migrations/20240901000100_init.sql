create table flyvest_tasks (
  task_id bigint primary key,
  completed boolean not null default false,
  dev_id integer,
  dev_name text,
  updated_at timestamp with time zone default now()
);

-- Add an index for faster look‑ups by developer
create index on flyvest_tasks (dev_id);
