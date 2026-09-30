export type ProjectStatus = 'Planning' | 'In Progress' | 'In Review' | 'Completed' | 'On Hold';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
  priority: Priority;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid';
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  description: string;
  budget: number;
  paidAmount: number;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  deadline: string;
  progress: number; // 0 to 100
  tasks: TaskItem[];
  milestones: ProjectMilestone[];
  tags: string[];
  createdAt: string;
}

export interface CreateProjectDto {
  title: string;
  clientId: string;
  description: string;
  budget: number;
  startDate: string;
  deadline: string;
  priority: Priority;
  tags?: string[];
}

export interface BackendProjectResponse {
  id: string;
  name?: string;
  title?: string;
  client?: string;
  clientId?: string;
  clientName?: string;
  clientCompany?: string;
  description?: string;
  budget?: number;
  spent?: number;
  status?: string;
  priority?: string;
  deadline?: string;
  progress?: number;
  tags?: string[];
  createdAt?: string;
}
