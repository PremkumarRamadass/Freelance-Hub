import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, Proposal, SubmitProposalDto } from '../../../core/models/project.model';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-browse-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    Dialog,
    Button,
    Tag,
    InputText,
    CurrencyInrPipe,
  ],
  templateUrl: './browse-projects.component.html',
  styleUrl: './browse-projects.component.scss',
})
export class BrowseProjectsComponent implements OnInit {
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  selectedSkill = signal<string>('All');
  selectedBudgetType = signal<string>('All');
  maxBudgetFilter = signal<number | null>(null);

  showProposalModal = signal<boolean>(false);
  selectedProject = signal<Project | null>(null);
  isSubmitting = signal<boolean>(false);

  mySubmittedProposalProjectIds = signal<Set<string>>(new Set<string>());

  proposalForm: FormGroup = this.fb.group({
    proposedPrice: [50000, [Validators.required, Validators.min(100)]],
    estimatedDelivery: ['20 Days', Validators.required],
    coverLetter: [
      '',
      [Validators.required, Validators.minLength(20)],
    ],
    relevantExperience: [''],
    attachments: [''],
  });

  // Category options
  categories = [
    'All',
    'Web App',
    'Mobile Apps',
    'Mobile Design',
    'DevOps & Cloud',
    'E-Commerce',
    'UI/UX Design',
    'AI & Machine Learning',
  ];

  // Popular skills list
  popularSkills = [
    'All',
    'Angular',
    'TypeScript',
    'NestJS',
    'PostgreSQL',
    'Docker',
    'Kubernetes',
    'AWS',
    'Figma',
    'Flutter',
    'Node.js',
  ];

  // Filter projects where status is Published or Under Review
  publishedProjects = computed(() => {
    const list = this.projectService.projects();
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const skill = this.selectedSkill().toLowerCase();
    const budgetType = this.selectedBudgetType();
    const maxBudget = this.maxBudgetFilter();

    return list.filter(p => {
      // Must be Published or Under Review to be visible in marketplace
      const isPublished = p.status === 'Published' || p.status === 'Under Review';
      if (!isPublished) return false;

      // Category filter
      if (cat !== 'All' && p.category !== cat) return false;

      // Budget Type filter
      if (budgetType !== 'All' && p.budgetType !== budgetType) return false;

      // Max Budget filter
      if (maxBudget && p.budget > maxBudget) return false;

      // Skill filter
      if (skill !== 'all') {
        const hasSkill = p.requiredSkills?.some(s => s.toLowerCase().includes(skill));
        if (!hasSkill) return false;
      }

      // Keyword query
      if (query) {
        const inTitle = p.title?.toLowerCase().includes(query);
        const inDesc = p.description?.toLowerCase().includes(query);
        const inClient = p.clientCompany?.toLowerCase().includes(query);
        const inSkill = p.requiredSkills?.some(s => s.toLowerCase().includes(query));
        if (!inTitle && !inDesc && !inClient && !inSkill) return false;
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.loadMyProposals();
  }

  loadMyProposals(): void {
    if (this.authService.isFreelancer()) {
      this.projectService.getMyProposals().subscribe(proposals => {
        if (proposals && proposals.length > 0) {
          const ids = new Set(proposals.map(p => p.projectId));
          this.mySubmittedProposalProjectIds.set(ids);
        }
      });
    }
  }

  hasSubmittedProposal(projectId: string): boolean {
    return this.mySubmittedProposalProjectIds().has(projectId);
  }

  openProposalModal(project: Project): void {
    this.selectedProject.set(project);
    this.proposalForm.reset({
      proposedPrice: project.budget || 50000,
      estimatedDelivery: '15 Days',
      coverLetter: '',
      relevantExperience: '',
      attachments: '',
    });
    this.showProposalModal.set(true);
  }

  closeProposalModal(): void {
    this.showProposalModal.set(false);
    this.selectedProject.set(null);
  }

  submitProposal(): void {
    if (this.proposalForm.invalid) {
      this.proposalForm.markAllAsTouched();
      return;
    }

    const proj = this.selectedProject();
    if (!proj) return;

    this.isSubmitting.set(true);
    const formVal = this.proposalForm.value;

    const dto: SubmitProposalDto = {
      proposedPrice: Number(formVal.proposedPrice),
      estimatedDelivery: formVal.estimatedDelivery,
      coverLetter: formVal.coverLetter,
      relevantExperience: formVal.relevantExperience,
      attachments: formVal.attachments,
    };

    this.projectService.submitProposal(proj.id, dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.mySubmittedProposalProjectIds.update(set => {
          const updated = new Set(set);
          updated.add(proj.id);
          return updated;
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Proposal Submitted! 🚀',
          detail: `Your proposal for "${proj.title}" has been sent to ${proj.clientCompany}.`,
        });
        this.closeProposalModal();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Error',
          detail: err.message || 'Unable to submit proposal.',
        });
      },
    });
  }
}
