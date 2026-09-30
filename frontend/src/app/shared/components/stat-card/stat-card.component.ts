import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();
  iconBg = input<string>('rgba(99, 102, 241, 0.1)');
  iconColor = input<string>('#6366f1');
  variant = input<'primary' | 'success' | 'warning' | 'danger' | 'info'>('primary');
  trend = input<string>('');
  trendPositive = input<boolean>(true);
  subtitle = input<string>('');
}
