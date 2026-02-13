export type Role = "user" | "company" | "admin";
export type VacancyStatus = "pending" | "approved";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  companyId?: Company | string;
}

export interface Company {
  _id: string;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  userId: string | User;
  isApproved: boolean;
}

export interface Vacancy {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  companyId: Company | string;
  status: VacancyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  _id: string;
  vacancyId: Vacancy | string;
  userId: User | string;
  cvFileUrl: string;
  createdAt?: string;
}
