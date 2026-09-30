import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, CreateTaskDto } from '../../core/models/task.model';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, Dialog, Button, Tag, InputText],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingTaskId = signal<string | null>(null);

  taskForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    assignee: ['Premkumar'],
    dueDate: ['2026-10-25'],
    priority: ['Medium'],
    status: ['Pending']
  });

  openAddTaskModal(): void {
    this.isEditing.set(false);
    this.editingTaskId.set(null);
    this.taskForm.reset({
      assignee: 'Premkumar',
      dueDate: '2026-10-25',
      priority: 'Medium',
      status: 'Pending'
    });
    this.showModal.set(true);
  }

  editTask(t: Task): void {
    this.isEditing.set(true);
    this.editingTaskId.set(t.id);
    this.taskForm.patchValue({
      title: t.title,
      description: t.description || '',
      assignee: t.assignee,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  toggleStatus(t: Task): void {
    const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
    this.taskService.updateTaskStatus(t.id, nextStatus);
    this.messageService.add({
      severity: nextStatus === 'Completed' ? 'success' : 'info',
      summary: nextStatus === 'Completed' ? 'Task Completed' : 'Task Reopened',
      detail: `"${t.title}" is now marked as ${nextStatus}.`
    });
  }

  saveTask(): void {
    if (this.taskForm.invalid) return;

    const val = this.taskForm.value;
    const dto: CreateTaskDto = {
      projectId: 'prj_1',
      title: val.title,
      description: val.description,
      assignee: val.assignee,
      dueDate: val.dueDate,
      priority: val.priority,
      status: val.status
    };

    this.taskService.addTask(dto).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Task Created',
        detail: `Task "${val.title}" added to sprint.`
      });
      this.closeModal();
    });
  }

  deleteTask(id: string): void {
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(id);
      this.messageService.add({
        severity: 'info',
        summary: 'Task Deleted',
        detail: 'Task has been removed.'
      });
    }
  }
}
