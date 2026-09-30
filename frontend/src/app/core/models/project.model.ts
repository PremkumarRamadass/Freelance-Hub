export type ProjectStatus =
  | 'Draft'
  | 'Published'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'In Review'
  | 'Completed'
  | 'Cancelled'
  | 'Closed'
  | 'Planning'
  | 'On Hold';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type BudgetType = 'Fixed Price' | 'Hourly';
export type ProposalStatus = 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'Closed';

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

export interface Proposal {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerAvatar?: string;
  proposedPrice: number;
  estimatedDelivery: string;
  coverLetter: string;
  relevantExperience?: string;
  attachments?: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  description: string;
  category?: string;
  budgetType?: BudgetType;
  budget: number;
  minBudget?: number;
  maxBudget?: number;
  paidAmount: number;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  deadline: string;
  progress: number; // 0 to 100
  requiredSkills: string[];
  attachments?: string[];
  additionalRequirements?: string;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
  assignedFreelancerEmail?: string;
  assignedFreelancerAvatar?: string;
  proposalsCount: number;
  tasks: TaskItem[];
  milestones: ProjectMilestone[];
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  clientId?: string;
  category?: string;
  budgetType?: BudgetType;
  budget?: number;
  minBudget?: number;
  maxBudget?: number;
  startDate?: string;
  deadline: string;
  priority: Priority;
  requiredSkills?: string[];
  attachments?: string[];
  additionalRequirements?: string;
  tags?: string[];
  status?: ProjectStatus;
}

export interface SubmitProposalDto {
  proposedPrice: number;
  estimatedDelivery: string;
  coverLetter: string;
  relevantExperience?: string;
  attachments?: string;
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
  category?: string;
  budgetType?: BudgetType;
  budget?: number;
  minBudget?: number;
  maxBudget?: number;
  spent?: number;
  status?: string;
  priority?: string;
  deadline?: string;
  progress?: number;
  requiredSkills?: string[];
  attachments?: string[];
  additionalRequirements?: string;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
  assignedFreelancerEmail?: string;
  assignedFreelancerAvatar?: string;
  proposalsCount?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
