export type TaskStatus = 'Completed' | 'In Progress' | 'Pending';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description?: string;
  assignee: string;
  assigneeAvatar?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface CreateTaskDto {
  projectId: string;
  title: string;
  description?: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface BackendTaskResponse {
  id: string;
  projectId?: string;
  projectName?: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  status?: string;
  priority?: string;
}
