import { Component, inject, signal, input, computed, Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, Proposal, SubmitProposalDto } from '../../../core/models/project.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    CurrencyInrPipe,
    Dialog,
    Button,
    Tag,
    InputText,
  ],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
})
export class ProjectDetailsComponent implements OnInit {
  authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  id = input<string>('prj_1');
  activeTab = signal<string>('overview');

  project: Signal<Project | undefined> = computed<Project | undefined>(() =>
    this.projectService.getProjectById(this.id()) || this.projectService.projects()[0],
  );

  proposals = signal<Proposal[]>([]);
  showProposalModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  proposalForm: FormGroup = this.fb.group({
    proposedPrice: [50000, [Validators.required, Validators.min(100)]],
    estimatedDelivery: ['20 Days', Validators.required],
    coverLetter: ['', [Validators.required, Validators.minLength(20)]],
    relevantExperience: [''],
    attachments: [''],
  });

  ngOnInit(): void {
    this.loadProposals();
  }

  loadProposals(): void {
    const p = this.project();
    if (p) {
      this.projectService.getProjectProposals(p.id).subscribe(proposals => {
        this.proposals.set(proposals || []);
      });
    }
  }

  toggleTask(taskId: string): void {
    const p = this.project();
    if (p) {
      this.projectService.toggleTaskCompletion(p.id, taskId);
    }
  }

  openProposalModal(): void {
    const p = this.project();
    this.proposalForm.reset({
      proposedPrice: p?.budget || 50000,
      estimatedDelivery: '15 Days',
      coverLetter: '',
      relevantExperience: '',
      attachments: '',
    });
    this.showProposalModal.set(true);
  }

  closeProposalModal(): void {
    this.showProposalModal.set(false);
  }

  submitProposal(): void {
    if (this.proposalForm.invalid) {
      this.proposalForm.markAllAsTouched();
      return;
    }

    const p = this.project();
    if (!p) return;

    this.isSubmitting.set(true);
    const formVal = this.proposalForm.value;

    const dto: SubmitProposalDto = {
      proposedPrice: Number(formVal.proposedPrice),
      estimatedDelivery: formVal.estimatedDelivery,
      coverLetter: formVal.coverLetter,
      relevantExperience: formVal.relevantExperience,
      attachments: formVal.attachments,
    };

    this.projectService.submitProposal(p.id, dto).subscribe({
      next: (createdProposal: Proposal) => {
        this.isSubmitting.set(false);
        this.proposals.update(list => [createdProposal, ...list]);
        this.messageService.add({
          severity: 'success',
          summary: 'Proposal Submitted! 🚀',
          detail: 'Your proposal has been submitted to the client.',
        });
        this.closeProposalModal();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Error',
          detail: err.message || 'Failed to submit proposal.',
        });
      },
    });
  }

  acceptProposal(proposal: Proposal): void {
    const p = this.project();
    if (!p) return;

    if (
      confirm(
        `Accept proposal from ${proposal.freelancerName} for ₹${proposal.proposedPrice}? This will assign the contract and notify the freelancer.`,
      )
    ) {
      this.projectService.acceptProposal(proposal.id, p.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Proposal Accepted! 🎉',
            detail: `Project is now Assigned to ${proposal.freelancerName}.`,
          });
          this.loadProposals();
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed',
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
          detail: 'Proposal has been marked as Rejected.',
        });
        this.loadProposals();
      },
    });
  }
}
