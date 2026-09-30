import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  status = input.required<string>();

  get normalizedStatus(): () => string {
    return () => this.status().toLowerCase().replace(/\s+/g, '-');
  }
}
