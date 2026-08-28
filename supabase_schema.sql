-- Cancer Companion Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  age integer,
  gender text,
  phone_number text,
  cancer_type text,
  cancer_stage text,
  diagnosis_date date,
  hospital text,
  doctor_name text,
  goals text[],
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
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  dosage text,
  time text,
  taken_today boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medications enable row level security;
create policy "Users can manage their medications" on medications for all using ( auth.uid() = user_id );

-- 3. Appointments Table
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  doctor text,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;
create policy "Users can manage their appointments" on appointments for all using ( auth.uid() = user_id );

-- 4. Symptoms Table
create table public.symptoms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pain integer default 0,
  fatigue integer default 0,
  nausea integer default 0,
  mood text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.symptoms enable row level security;
create policy "Users can manage their symptoms" on symptoms for all using ( auth.uid() = user_id );

-- 5. Daily Wellness (Hydration) Table
create table public.daily_wellness (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  water_glasses integer default 0,
  date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.daily_wellness enable row level security;
create policy "Users can manage their daily wellness" on daily_wellness for all using ( auth.uid() = user_id );

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

-- Note: In a real app, you might want to create a trigger to auto-create a profile 
-- when a user signs up. Since we have a specific onboarding flow, we'll let the client 
-- handle the initial insert into the profiles table during onboarding.
