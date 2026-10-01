import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  authService = inject(AuthService);
  isCollapsed = signal<boolean>(false);

  navItems = computed<NavItem[]>(() => {
    if (this.authService.isClient()) {
      return [
        { label: 'Dashboard', icon: 'pi-th-large', route: '/dashboard' },
        { label: 'My Projects', icon: 'pi-folder', route: '/projects' },
        { label: 'Project Tasks', icon: 'pi-check-square', route: '/tasks' },
        { label: 'Quotations', icon: 'pi-file-edit', route: '/quotations' },
        { label: 'Invoices', icon: 'pi-file', route: '/invoices' },
        { label: 'Documents', icon: 'pi-paperclip', route: '/documents' },
        { label: 'Notifications', icon: 'pi-bell', route: '/notifications', badge: '1' },
        { label: 'AI Assistant & Chat', icon: 'pi-comments', route: '/chat' },
        { label: 'Settings', icon: 'pi-cog', route: '/settings' }
      ];
    }

    return [
      { label: 'Dashboard', icon: 'pi-th-large', route: '/dashboard' },
      { label: 'Browse Projects', icon: 'pi-compass', route: '/browse-projects' },
      { label: 'Clients', icon: 'pi-users', route: '/clients' },
      { label: 'Projects', icon: 'pi-folder', route: '/projects' },
      { label: 'Tasks', icon: 'pi-check-square', route: '/tasks' },
      { label: 'Quotations', icon: 'pi-file-edit', route: '/quotations' },
      { label: 'Invoices', icon: 'pi-file', route: '/invoices' },
      { label: 'Payments', icon: 'pi-credit-card', route: '/payments' },
      { label: 'Reports', icon: 'pi-chart-line', route: '/reports' },
      { label: 'Documents', icon: 'pi-paperclip', route: '/documents' },
      { label: 'Notifications', icon: 'pi-bell', route: '/notifications', badge: '3' },
      { label: 'AI Assistant & Chat', icon: 'pi-comments', route: '/chat' },
      { label: 'Settings', icon: 'pi-cog', route: '/settings' }
    ];
  });

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }
}
