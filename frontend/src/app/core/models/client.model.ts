export type ClientStatus = 'Active' | 'Lead' | 'Inactive' | 'Completed';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatarUrl?: string;
  status: ClientStatus;
  projectsCount: number;
  totalBilled: number;
  country: string;
  notes?: string;
  createdAt: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone: string;
  company: string;
  country?: string;
  notes?: string;
}

export interface BackendClientResponse {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
  status?: string;
  projectsCount?: number;
  activeProjects?: number;
  totalBilled?: number;
  avatarUrl?: string;
  notes?: string;
  createdAt?: string;
}
