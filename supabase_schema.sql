-- ========================================================
-- Cancer Companion Complete Supabase Schema
-- ========================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------
-- 1. Profiles Table
-- Stores user personal details, diagnosis, care team, and onboarding status
-- --------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  age integer,
  gender text,
  phone text,
  cancer_type text,
  cancer_stage text,
  diagnosis_date date,
  hospital text,
  doctor_name text,
  goals text[],
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Drop existing policies to allow clean re-running
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles
  for select using ( auth.uid() = id or auth.uid() = user_id );

create policy "Users can update own profile" on public.profiles
  for update using ( auth.uid() = id or auth.uid() = user_id );

create policy "Users can insert own profile" on public.profiles
  for insert with check ( auth.uid() = id or auth.uid() = user_id );

-- Trigger for auto-updating updated_at timestamp on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.handle_updated_at();

-- --------------------------------------------------------
-- 2. Medications Table
-- Tracks prescriptions, dosages, schedules, and daily adherence
-- --------------------------------------------------------
create table if not exists public.medications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  dosage text,
  frequency text,
  time text,
  notes text,
  taken_today boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medications enable row level security;

drop policy if exists "Users can view own medications" on public.medications;
drop policy if exists "Users can update own medications" on public.medications;
drop policy if exists "Users can insert own medications" on public.medications;
drop policy if exists "Users can delete own medications" on public.medications;

create policy "Users can view own medications" on public.medications
  for select using ( auth.uid() = user_id );

create policy "Users can update own medications" on public.medications
  for update using ( auth.uid() = user_id );

create policy "Users can insert own medications" on public.medications
  for insert with check ( auth.uid() = user_id );

create policy "Users can delete own medications" on public.medications
  for delete using ( auth.uid() = user_id );

-- --------------------------------------------------------
-- 3. Appointments Table
-- Manages consultations, chemotherapy, radiation, and doctor visits
-- --------------------------------------------------------
create table if not exists public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  doctor text,
  hospital text,
  date text,
  time text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;

drop policy if exists "Users can view own appointments" on public.appointments;
drop policy if exists "Users can update own appointments" on public.appointments;
drop policy if exists "Users can insert own appointments" on public.appointments;
drop policy if exists "Users can delete own appointments" on public.appointments;

create policy "Users can view own appointments" on public.appointments
  for select using ( auth.uid() = user_id );

create policy "Users can update own appointments" on public.appointments
  for update using ( auth.uid() = user_id );

create policy "Users can insert own appointments" on public.appointments
  for insert with check ( auth.uid() = user_id );

create policy "Users can delete own appointments" on public.appointments
  for delete using ( auth.uid() = user_id );

-- --------------------------------------------------------
-- 4. Symptoms Table
-- Logs daily side-effects (pain, fatigue, nausea) and mood rating
-- --------------------------------------------------------
create table if not exists public.symptoms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  pain integer default 0,
  fatigue integer default 0,
  nausea integer default 0,
  mood text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.symptoms enable row level security;

drop policy if exists "Users can view own symptoms" on public.symptoms;
drop policy if exists "Users can update own symptoms" on public.symptoms;
drop policy if exists "Users can insert own symptoms" on public.symptoms;
drop policy if exists "Users can delete own symptoms" on public.symptoms;

create policy "Users can view own symptoms" on public.symptoms
  for select using ( auth.uid() = user_id );

create policy "Users can update own symptoms" on public.symptoms
  for update using ( auth.uid() = user_id );

create policy "Users can insert own symptoms" on public.symptoms
  for insert with check ( auth.uid() = user_id );

create policy "Users can delete own symptoms" on public.symptoms
  for delete using ( auth.uid() = user_id );

-- --------------------------------------------------------
-- 5. Wellness Logs Table
-- Logs hydration (water glasses), sleep, exercise, and wellness metrics
-- --------------------------------------------------------
create table if not exists public.wellness_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  water_glasses integer default 0,
  mood text,
  sleep_hours numeric,
  exercise_minutes integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wellness_logs enable row level security;

drop policy if exists "Users can view own wellness" on public.wellness_logs;
drop policy if exists "Users can update own wellness" on public.wellness_logs;
drop policy if exists "Users can insert own wellness" on public.wellness_logs;
drop policy if exists "Users can delete own wellness" on public.wellness_logs;

create policy "Users can view own wellness" on public.wellness_logs
  for select using ( auth.uid() = user_id );

create policy "Users can update own wellness" on public.wellness_logs
  for update using ( auth.uid() = user_id );

create policy "Users can insert own wellness" on public.wellness_logs
  for insert with check ( auth.uid() = user_id );

create policy "Users can delete own wellness" on public.wellness_logs
  for delete using ( auth.uid() = user_id );
