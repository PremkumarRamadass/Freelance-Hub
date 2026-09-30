import { Component, inject, input, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuotationService } from '../../../core/services/quotation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quotation } from '../../../core/models/quotation.model';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-quotation-details',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyInrPipe, Tag, Button],
  templateUrl: './quotation-details.component.html',
  styleUrl: './quotation-details.component.scss'
})
export class QuotationDetailsComponent {
  authService = inject(AuthService);
  private quotationService = inject(QuotationService);
  private messageService = inject(MessageService);

  id = input<string>('quot_1');
  feedbackMessage = signal<string>('');

  quote: Signal<Quotation | undefined> = computed<Quotation | undefined>(() =>
    this.quotationService.getQuotationById(this.id()) || this.quotationService.quotations()[0]
  );

  printQuote(): void {
    window.print();
  }

  sendQuote(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Quotation Dispatched',
      detail: `Quotation ${this.quote()?.quotationNumber} sent to client!`
    });
  }

  approveQuote(): void {
    const q = this.quote();
    if (q) {
      this.quotationService.updateStatus(q.id, 'Accepted');
      this.feedbackMessage.set('🎉 Quotation approved successfully! The freelancer has been notified.');
      this.messageService.add({
        severity: 'success',
        summary: 'Quotation Accepted',
        detail: `Proposal ${q.quotationNumber} has been approved.`
      });
    }
  }

  requestRevision(): void {
    const reason = prompt('Please describe the changes or scope adjustments requested:');
    if (reason) {
      const q = this.quote();
      if (q) {
        this.quotationService.updateStatus(q.id, 'Draft');
        this.feedbackMessage.set('📝 Revision request sent with notes: "' + reason + '"');
      }
    }
  }
}
