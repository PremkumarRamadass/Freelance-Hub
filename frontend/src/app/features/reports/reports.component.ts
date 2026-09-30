import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { FinancialSummary, MonthlyTrend } from '../../core/models/report.model';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyInrPipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reportService = inject(ReportService);

  summary: Signal<FinancialSummary> = this.reportService.summary;
  monthlyData: Signal<MonthlyTrend[]> = this.reportService.trends;

  exportReport(): void {
    window.open(this.reportService.exportCsvUrl(), '_blank');
  }
}
