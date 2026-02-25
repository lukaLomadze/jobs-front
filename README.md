# Jobs Frontend

A Next.js 16-based job board frontend application that connects to the Jobs Backend API. Provides a modern, responsive interface for job seekers, companies, and administrators.

## Features

### For Job Seekers (Users)
- **Home Page**: Browse and search vacancies with filters
- **Job Search**: Filter by keyword, category, location, and salary range
- **Job Details**: View full vacancy information
- **Apply to Jobs**: Submit applications with CV upload
- **Application Tracking**: View submitted applications and their status

### For Companies
- **Sign Up**: Register company account
- **Company Dashboard**: Manage company profile
- **Vacancy Management**: Create, edit, and delete job postings
- **Application Management**: View and manage received applications

### For Administrators
- **Admin Dashboard**: System oversight
- **Company Management**: Approve or ban companies
- **Vacancy Moderation**: Review and approve/reject pending vacancies
- **Application Overview**: View all applications in the system

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Dark theme with modern aesthetics
- Real-time search and filtering
- Toast notifications
- Loading states and error handling

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Components**: Radix UI primitives + custom components
- **Icons**: Lucide React

## Project Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page entry
├── HomePage.tsx           # Main homepage component
├── globals.css            # Global styles
│
├── auth/                  # Authentication pages
│   ├── sign-in/
│   ├── sign-up/
│   │   ├── user/
│   │   └── company/
│
├── vacancies/             # Job vacancy pages
│   └── [id]/
│       └── page.tsx      # Vacancy details
│
├── user/                  # Job seeker pages
│   └── applications/
│       └── page.tsx      # User's applications
│
├── company/               # Company pages
│   ├── page.tsx          # Company dashboard
│   ├── vacancies/
│   │   ├── new/          # Create vacancy
│   │   └── [id]/
│   │       └── edit/     # Edit vacancy
│   └── applications/     # Received applications
│
└── admin/                # Admin pages
    ├── page.tsx          # Admin dashboard
    ├── companies/        # Manage companies
    ├── vacancies/        # Moderate vacancies
    └── applications/     # View all applications

components/
├── ui/                   # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── label.tsx
├── Nav.tsx              # Navigation component

lib/
├── axios-instance.ts    # Axios configuration

types/
└── index.ts             # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- Running backend server (Jobs Backend)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd jobs-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variable:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Running the Application

#### Development
```bash
npm run dev
```

#### Production Build
```bash
npm run build
npm run start
```

The application will be available at `http://localhost:3000`

## Pages Overview

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Home - Browse & search jobs | Public |
| `/vacancies/[id]` | Job details | Public |
| `/auth/sign-in` | User login | Public |
| `/auth/sign-up/user` | Job seeker registration | Public |
| `/auth/sign-up/company` | Company registration | Public |
| `/user/applications` | My applications | User |
| `/company` | Company dashboard | Company |
| `/company/vacancies/new` | Post new vacancy | Company |
| `/company/vacancies/[id]/edit` | Edit vacancy | Company |
| `/company/applications` | Received applications | Company |
| `/admin` | Admin dashboard | Admin |
| `/admin/companies` | Manage companies | Admin |
| `/admin/vacancies` | Moderate vacancies | Admin |
| `/admin/applications` | View all applications | Admin |

## Type Definitions

```typescript
type Role = "user" | "company" | "admin";
type VacancyStatus = "pending" | "approved";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  companyId?: Company | string;
}

interface Company {
  _id: string;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  userId: string | User;
  isApproved: boolean;
}

interface Vacancy {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  companyId: Company | string;
  status: VacancyStatus;
}

interface Application {
  _id: string;
  vacancyId: Vacancy | string;
  userId: User | string;
  cvFileUrl: string;
  createdAt?: string;
}
```

## API Integration

The frontend uses Axios for HTTP requests. The base URL is configured via `NEXT_PUBLIC_API_URL` environment variable.

Example API call:
```typescript
import axiosInstance from "@/lib/axios-instance";

const response = await axiosInstance.get("/vacancies", {
  params: {
    search: "developer",
    category: "IT",
    location: "Remote",
    page: 1,
    take: 12
  }
});
```

## License

Private - All rights reserved
