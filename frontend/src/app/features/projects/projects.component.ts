import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Project,
  CreateProjectDto,
  ProjectStatus,
  Priority,
  BudgetType,
  Proposal,
} from '../../core/models/project.model';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    Dialog,
    Button,
    ProgressBar,
    Tag,
    InputText,
    CurrencyInrPipe,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit {
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  clientService = inject(ClientService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  searchQuery = signal<string>('');
  selectedStatus = signal<string>('All');
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingProjectId = signal<string | null>(null);

  // Proposals Review Modal
  showProposalsModal = signal<boolean>(false);
  selectedProjectForProposals = signal<Project | null>(null);
  activeProjectProposals = signal<Proposal[]>([]);
  loadingProposals = signal<boolean>(false);

  // Category presets
  categoryOptions = [
    'Web App',
    'Mobile Apps',
    'Mobile Design',
    'DevOps & Cloud',
    'E-Commerce',
    'UI/UX Design',
    'AI & Machine Learning',
    'Full Stack',
  ];

  // Quick skill pills
  quickSkills = ['Angular', 'TypeScript', 'NestJS', 'PostgreSQL', 'Docker', 'AWS', 'Figma', 'Node.js'];

  projectForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    clientId: ['cli_1'],
    description: ['Enterprise web platform and application development.', [Validators.required, Validators.minLength(15)]],
    requiredSkills: ['Angular, TypeScript, NestJS', Validators.required],
    category: ['Web App'],
    budgetType: ['Fixed Price'],
    budget: [75000, [Validators.required, Validators.min(1000)]],
    minBudget: [null],
    maxBudget: [null],
    startDate: ['2026-10-01'],
    deadline: ['2026-12-31', Validators.required],
    priority: ['Medium'],
    attachments: [''],
    additionalRequirements: [''],
    tags: [''],
  });

  filteredProjects = computed(() => {
    const list = this.projectService.projects();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const isClient = this.authService.isClient();
    const currentUser = this.authService.currentUser();

    return list.filter(p => {
      // Scoping for Client: Match their company or ID or demo company
      let matchClient = true;
      if (isClient) {
        const clientCompany = (currentUser?.companyName || 'ABC Pvt Ltd').toLowerCase();
        const clientEmail = (currentUser?.email || '').toLowerCase();
        const clientName = (currentUser?.name || '').toLowerCase();

        matchClient =
          p.clientId === currentUser?.id ||
          p.clientCompany?.toLowerCase().includes(clientCompany) ||
          p.clientName?.toLowerCase().includes(clientName) ||
          p.clientCompany?.toLowerCase().includes('abc') ||
          p.clientId === 'cli_1';
      }

      // Keyword query
      const matchQuery =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.clientCompany?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.requiredSkills?.some(s => s.toLowerCase().includes(query));

      // Status filter
      const matchStatus = status === 'All' || p.status === status;

      return matchClient && matchQuery && matchStatus;
    });
  });

  ngOnInit(): void {
    if (this.authService.isClient() && this.authService.currentUser()) {
      const user = this.authService.currentUser()!;
      this.projectForm.patchValue({
        clientId: user.id,
      });
    }
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingProjectId.set(null);
    const currentUser = this.authService.currentUser();

    this.projectForm.reset({
      title: '',
      clientId: currentUser?.id || 'cli_1',
      description: '',
      requiredSkills: 'Angular, TypeScript, NestJS',
      category: 'Web App',
      budgetType: 'Fixed Price',
      budget: 75000,
      minBudget: null,
      maxBudget: null,
      startDate: new Date().toISOString().split('T')[0],
      deadline: '2026-12-31',
      priority: 'Medium',
      attachments: '',
      additionalRequirements: '',
      tags: '',
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.editingProjectId.set(null);
  }

  addSkillPill(skill: string): void {
    const current = this.projectForm.get('requiredSkills')?.value || '';
    const skillsList = current
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (!skillsList.includes(skill)) {
      skillsList.push(skill);
      this.projectForm.patchValue({
        requiredSkills: skillsList.join(', '),
      });
    }
  }

  editProject(p: Project): void {
    this.isEditing.set(true);
    this.editingProjectId.set(p.id);

    this.projectForm.patchValue({
      title: p.title,
      clientId: p.clientId,
      description: p.description,
      requiredSkills: p.requiredSkills?.join(', ') || p.tags?.join(', ') || '',
      category: p.category || 'Web App',
      budgetType: p.budgetType || 'Fixed Price',
      budget: p.budget,
      minBudget: p.minBudget,
      maxBudget: p.maxBudget,
      startDate: p.startDate,
      deadline: p.deadline,
      priority: p.priority,
      attachments: p.attachments?.join(', ') || '',
      additionalRequirements: p.additionalRequirements || '',
    });
    this.showModal.set(true);
  }

  saveProject(targetStatus?: ProjectStatus): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const val = this.projectForm.value;
    const currentUser = this.authService.currentUser();
    const client = this.clientService.getClientById(val.clientId);

    const clientName = currentUser?.name || client?.name || 'Client Representative';
    const clientCompany = currentUser?.companyName || client?.company || 'Enterprise Partner';

    const skillsArray = val.requiredSkills
      ? val.requiredSkills
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : ['Web Development'];

    const attachmentsArray = val.attachments
      ? val.attachments
          .split(',')
          .map((a: string) => a.trim())
          .filter(Boolean)
      : [];

    const statusChoice: ProjectStatus =
      targetStatus || (this.isEditing() ? 'Published' : 'Published');

    const dto: CreateProjectDto = {
      title: val.title,
      clientId: currentUser?.id || val.clientId,
      description: val.description,
      category: val.category || 'Web App',
      budgetType: (val.budgetType as BudgetType) || 'Fixed Price',
      budget: Number(val.budget),
      minBudget: val.minBudget ? Number(val.minBudget) : undefined,
      maxBudget: val.maxBudget ? Number(val.maxBudget) : Number(val.budget),
      startDate: val.startDate || new Date().toISOString().split('T')[0],
      deadline: val.deadline,
      priority: val.priority || 'Medium',
      requiredSkills: skillsArray,
      attachments: attachmentsArray,
      additionalRequirements: val.additionalRequirements,
      status: statusChoice,
      tags: skillsArray,
    };

    if (this.isEditing() && this.editingProjectId()) {
      this.projectService.updateProject(this.editingProjectId()!, dto as any).subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Project Updated',
          detail: `Project "${val.title}" has been updated.`,
        });
        this.closeModal();
      });
    } else {
      this.projectService.createProject(dto, clientName, clientCompany, statusChoice).subscribe(() => {
        const statusLabel = statusChoice === 'Draft' ? 'Saved as Draft' : 'Published to Marketplace';
        this.messageService.add({
          severity: 'success',
          summary: `Project ${statusLabel}! 🚀`,
          detail: `"${val.title}" is now ${statusChoice.toLowerCase()}.`,
        });
        this.closeModal();
      });
    }
  }

  // Lifecycle status actions
  publishProject(p: Project): void {
    this.projectService.updateProjectStatus(p.id, 'Published').subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Project Published! 🌟',
        detail: `"${p.title}" is now visible to freelancers in the Marketplace.`,
      });
    });
  }

  unpublishProject(p: Project): void {
    this.projectService.updateProjectStatus(p.id, 'Draft').subscribe(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Project Unpublished',
        detail: `"${p.title}" reverted to Draft status.`,
      });
    });
  }

  cancelProject(p: Project): void {
    if (confirm(`Are you sure you want to cancel "${p.title}"?`)) {
      this.projectService.updateProjectStatus(p.id, 'Cancelled').subscribe(() => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Project Cancelled',
          detail: `"${p.title}" has been marked as Cancelled.`,
        });
      });
    }
  }

  closeProject(p: Project): void {
    this.projectService.updateProjectStatus(p.id, 'Closed').subscribe(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Project Closed',
        detail: `"${p.title}" has been archived.`,
      });
    });
  }

  // Proposals management modal
  openProposalsModal(p: Project): void {
    this.selectedProjectForProposals.set(p);
    this.loadingProposals.set(true);
    this.showProposalsModal.set(true);

    this.projectService.getProjectProposals(p.id).subscribe({
      next: (proposals: Proposal[]) => {
        this.activeProjectProposals.set(proposals);
        this.loadingProposals.set(false);
      },
      error: () => {
        this.loadingProposals.set(false);
      },
    });
  }

  closeProposalsModal(): void {
    this.showProposalsModal.set(false);
    this.selectedProjectForProposals.set(null);
    this.activeProjectProposals.set([]);
  }

  acceptProposal(proposal: Proposal): void {
    const proj = this.selectedProjectForProposals();
    if (!proj) return;

    if (
      confirm(
        `Accept proposal from ${proposal.freelancerName} for ₹${proposal.proposedPrice}? This will assign the project and decline other proposals.`,
      )
    ) {
      this.projectService.acceptProposal(proposal.id, proj.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Proposal Accepted! 🎉',
            detail: `Project "${proj.title}" is now Assigned to ${proposal.freelancerName}.`,
          });
          // Refresh proposals
          this.openProposalsModal(proj);
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Action Failed',
            detail: err.message || 'Could not accept proposal.',
          });
        },
      });
    }
  }

  rejectProposal(proposal: Proposal): void {
    this.projectService.rejectProposal(proposal.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Proposal Declined',
          detail: `Proposal from ${proposal.freelancerName} marked as Rejected.`,
        });
        const proj = this.selectedProjectForProposals();
        if (proj) this.openProposalsModal(proj);
      },
    });
  }

  deleteProject(id: string, title: string): void {
    if (confirm(`Delete project "${title}"?`)) {
      this.projectService.deleteProject(id).subscribe(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Project Deleted',
          detail: `Project "${title}" was removed.`,
        });
      });
    }
  }
}
