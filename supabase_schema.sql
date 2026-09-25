-- Cancer Companion Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  user_id uuid references auth.users on delete cascade,
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
create policy "Users can view own profile" on profiles for select using ( auth.uid() = id );
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );
create policy "Users can insert own profile" on profiles for insert with check ( auth.uid() = id );

-- 2. Medications Table
create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  dosage text,
  frequency text,
  time text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medications enable row level security;
create policy "Users can view own medications" on medications for select using ( auth.uid() = user_id );
create policy "Users can update own medications" on medications for update using ( auth.uid() = user_id );
create policy "Users can insert own medications" on medications for insert with check ( auth.uid() = user_id );
create policy "Users can delete own medications" on medications for delete using ( auth.uid() = user_id );

-- 3. Appointments Table
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  doctor text,
  hospital text,
  date text,
  time text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;
create policy "Users can view own appointments" on appointments for select using ( auth.uid() = user_id );
create policy "Users can update own appointments" on appointments for update using ( auth.uid() = user_id );
create policy "Users can insert own appointments" on appointments for insert with check ( auth.uid() = user_id );
create policy "Users can delete own appointments" on appointments for delete using ( auth.uid() = user_id );

-- 4. Symptoms Table
create table public.symptoms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  pain integer default 0,
  fatigue integer default 0,
  nausea integer default 0,
  mood text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.symptoms enable row level security;
create policy "Users can view own symptoms" on symptoms for select using ( auth.uid() = user_id );
create policy "Users can update own symptoms" on symptoms for update using ( auth.uid() = user_id );
create policy "Users can insert own symptoms" on symptoms for insert with check ( auth.uid() = user_id );
create policy "Users can delete own symptoms" on symptoms for delete using ( auth.uid() = user_id );

-- 5. Wellness Logs Table
create table public.wellness_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  water_glasses integer default 0,
  mood text,
  sleep_hours numeric,
  exercise_minutes integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wellness_logs enable row level security;
create policy "Users can view own wellness" on wellness_logs for select using ( auth.uid() = user_id );
create policy "Users can update own wellness" on wellness_logs for update using ( auth.uid() = user_id );
create policy "Users can insert own wellness" on wellness_logs for insert with check ( auth.uid() = user_id );
create policy "Users can delete own wellness" on wellness_logs for delete using ( auth.uid() = user_id );

-- Create trigger for updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.handle_updated_at();
alter table medications add column if not exists taken_today boolean default false; 
