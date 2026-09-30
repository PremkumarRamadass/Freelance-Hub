import { Component, inject, signal, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, CurrencyInrPipe],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent {
  private projectService = inject(ProjectService);

  id = input<string>('prj_1');
  activeTab = signal<string>('overview');

  project: Signal<Project | undefined> = computed<Project | undefined>(() =>
    this.projectService.getProjectById(this.id()) || this.projectService.projects()[0]
  );

  toggleTask(taskId: string): void {
    const p = this.project();
    if (p) {
      this.projectService.toggleTaskCompletion(p.id, taskId);
    }
  }
}
