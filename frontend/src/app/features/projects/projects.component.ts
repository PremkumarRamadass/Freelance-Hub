import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/services/auth.service';
import { Project, CreateProjectDto } from '../../core/models/project.model';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, Dialog, Button, ProgressBar, Tag, InputText],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  clientService = inject(ClientService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  searchQuery = signal<string>('');
  selectedStatus = signal<string>('All');
  showModal = signal<boolean>(false);

  projectForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    clientId: ['', Validators.required],
    budget: [75000, [Validators.required, Validators.min(1000)]],
    startDate: ['2026-10-01'],
    deadline: ['2026-11-30', Validators.required],
    priority: ['High'],
    tags: ['Angular, Node.js, MongoDB, Tailwind CSS'],
    description: ['Full website development with modern UI/UX and CMS integration.']
  });

  filteredProjects = computed(() => {
    const list = this.projectService.projects();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const isClient = this.authService.isClient();

    return list.filter(p => {
      const matchClient = !isClient || p.clientCompany.toLowerCase().includes('abc') || p.clientId === 'cli_1';
      const matchQuery = !query || p.title.toLowerCase().includes(query) || p.clientCompany.toLowerCase().includes(query);
      const matchStatus = status === 'All' || p.status === status;
      return matchClient && matchQuery && matchStatus;
    });
  });

  openAddModal(): void {
    this.projectForm.reset({
      budget: 75000,
      startDate: '2026-10-01',
      deadline: '2026-11-30',
      priority: 'High',
      tags: 'Angular, Node.js, MongoDB, Tailwind CSS',
      description: 'Full website development with modern UI/UX and CMS integration.'
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  editProject(p: Project): void {
    this.projectForm.patchValue({
      title: p.title,
      clientId: p.clientId,
      budget: p.budget,
      startDate: p.startDate,
      deadline: p.deadline,
      priority: p.priority,
      tags: p.tags.join(', '),
      description: p.description
    });
    this.showModal.set(true);
  }

  saveProject(): void {
    if (this.projectForm.invalid) return;

    const val = this.projectForm.value;
    const client = this.clientService.getClientById(val.clientId);
    const clientName = client ? client.name : 'Client';
    const clientCompany = client ? client.company : 'Company';

    const tagsArray = val.tags ? val.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

    const dto: CreateProjectDto = {
      title: val.title,
      clientId: val.clientId,
      description: val.description,
      budget: Number(val.budget),
      startDate: val.startDate,
      deadline: val.deadline,
      priority: val.priority,
      tags: tagsArray
    };

    this.projectService.createProject(dto, clientName, clientCompany).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Project Saved',
        detail: `Project "${val.title}" has been saved.`
      });
      this.closeModal();
    });
  }

  deleteProject(id: string, title: string): void {
    if (confirm(`Delete project "${title}"?`)) {
      this.projectService.deleteProject(id).subscribe(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Project Deleted',
          detail: `Project "${title}" was removed.`
        });
      });
    }
  }
}
