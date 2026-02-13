# Jobs Board – Frontend

Next.js frontend for the Jobs Board API. Uses all backend endpoints for auth, vacancies, applications, company dashboard, and admin panel.

## Setup

1. Copy `.env.example` to `.env.local` and set:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3005
   ```
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Who | Description |
|-------|-----|-------------|
| `/` | Everyone | Vacancies list with search (keyword, category, location, salary) |
| `/auth/sign-in` | Guest | Sign in (email/password or Google) |
| `/auth/sign-up` | Guest | Choose user or company sign up |
| `/auth/sign-up/user` | Guest | Job seeker registration |
| `/auth/sign-up/company` | Guest | Company registration |
| `/vacancies/[id]` | Everyone | Vacancy detail; logged-in users can apply (upload PDF CV) |
| `/user/applications` | User | List of my applications |
| `/company` | Company | Dashboard: my vacancies (approved/pending), link to applications |
| `/company/vacancies/new` | Company | Create vacancy |
| `/company/vacancies/[id]/edit` | Company | Edit or delete vacancy |
| `/company/applications` | Company | All applications for my vacancies |
| `/company/applications/[id]` | Company | Applications for one vacancy |
| `/admin` | Admin | Pending companies (approve/ban), pending vacancies (approve/reject) |
| `/admin/companies` | Admin | List all companies |

## Backend

Ensure `jobs-backend` is running (e.g. `npm run start:dev` on port 3005). CORS should allow `FRONT_URL` (e.g. http://localhost:3000).
