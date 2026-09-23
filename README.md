# Cancer Companion - A Modern Healthcare Application

Cancer Companion is a secure, private, and personalized web application designed to help patients manage their healthcare journey. Built with a modern React stack, it offers a beautifully designed interface for tracking symptoms, managing medications, organizing appointments, and accessing supportive wellness resources.

## Features
- **Dashboard:** Real-time health score calculation based on daily hydration, symptom logging, and medication adherence.
- **Medication Manager:** Keep track of complex prescriptions with daily adherence tracking.
- **Symptom Tracker:** Log daily fatigue, pain, nausea, and mood levels to build a history of your wellbeing.
- **Appointments:** Organize hospital visits, chemotherapy sessions, and laboratory work.
- **AI Health Assistant:** Ask health-related questions with an embedded offline-capable AI interface.
- **Mental Wellness:** Guided breathing exercises, meditation timer, and gratitude journals.
- **Nutrition Guide:** Stay on top of hydration and dietary targets during treatments.
- **Emergency Contacts:** 1-tap dial features for immediate access to healthcare teams.

## Tech Stack
- React & Vite
- Tailwind CSS
- React Router DOM
- Supabase (PostgreSQL Database & Authentication)
- Lucide React (Icons)

---

## 🚀 Setup & Installation (Local Development)

### Prerequisites
- Node.js installed on your machine
- A [Supabase](https://supabase.com/) account (Free tier is perfectly fine)

### 1. Clone & Install
Open your terminal and navigate to the project directory, then install the dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (where `package.json` is located) and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase Database
In your Supabase project dashboard, navigate to the **SQL Editor** and run the contents of the `supabase_schema.sql` file provided in this repository. 
This script will automatically:
- Create the necessary tables (`profiles`, `symptoms`, `appointments`, `medications`, `wellness_logs`, `community_posts`, `emergency_contacts`, `health_reports`)
- Set up strict Row Level Security (RLS) policies so users can only access their own data.
- Enable necessary real-time triggers.

### 4. Run Locally
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🌍 Production Deployment (Vercel)
Deploying to Vercel is highly recommended and takes just a few minutes.

1. Create a GitHub repository and push this codebase to it.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Expand the **Environment Variables** section in the Vercel deployment settings and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically build the Vite application and host it on a global CDN.

---

## Note on Security & Architecture
- **No Hardcoded Data:** The application dynamically fetches everything from your secure Supabase backend.
- **Authentication:** Relies exclusively on Supabase Auth.
- **Onboarding Guard:** Users are forced to complete their profile before accessing the main dashboard, ensuring a clean personal dataset.
