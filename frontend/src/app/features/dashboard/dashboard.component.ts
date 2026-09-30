import { Component, inject, OnInit, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { PaymentService } from '../../core/services/payment.service';
import { DashboardService } from '../../core/services/dashboard.service';
import {
  MonthlyRevenueData,
  DashboardRecentProject,
  DashboardDeadlineItem,
  DashboardTaskStats
} from '../../core/models/dashboard.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    CurrencyInrPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  clientService = inject(ClientService);
  paymentService = inject(PaymentService);
  dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.fetchStats();
    const user = this.authService.currentUser();
    if (user?.email) {
      this.dashboardService.fetchClientPortal(user.email);
    }
  }

  monthlyData: Signal<MonthlyRevenueData[]> = computed<MonthlyRevenueData[]>(() => {
    return this.dashboardService.stats().monthlyData || [];
  });

  taskStats: Signal<DashboardTaskStats> = computed<DashboardTaskStats>(() => {
    return this.dashboardService.stats().tasks || { total: 0, completed: 0, inProgress: 0, pending: 0 };
  });

  recentProjects: Signal<DashboardRecentProject[]> = computed<DashboardRecentProject[]>(() => {
    const backendProjects = this.dashboardService.stats().recentProjects;
    if (backendProjects && backendProjects.length > 0) {
      return backendProjects.map(p => ({
        id: p.id,
        name: p.name,
        client: p.client || 'Client Partner',
        deadline: p.deadline || '30 Nov 2026',
        progress: Number(p.progress ?? 50),
        status: p.status || 'Active'
      }));
    }

    return this.projectService.projects().map(p => ({
      id: p.id,
      name: p.title,
      client: p.clientCompany,
      deadline: p.deadline,
      progress: p.progress,
      status: p.status
    }));
  });

  deadlines: Signal<DashboardDeadlineItem[]> = computed<DashboardDeadlineItem[]>(() => {
    const list = this.projectService.projects();
    return list.slice(0, 3).map((p, idx) => ({
      id: p.id,
      client: p.clientCompany || 'Enterprise Client',
      project: p.title,
      daysLeft: `${(idx + 1) * 3} days left`,
      dueDate: p.deadline,
      days: (idx + 1) * 3
    }));
  });

  displayedProjects: Signal<DashboardRecentProject[]> = computed<DashboardRecentProject[]>(() => {
    const list = this.recentProjects();
    return this.authService.isClient() ? list.slice(0, 1) : list;
  });

  displayedDeadlines: Signal<DashboardDeadlineItem[]> = computed<DashboardDeadlineItem[]>(() => {
    const list = this.deadlines();
    return this.authService.isClient() ? list.slice(0, 1) : list;
  });
}
