import { Component, inject, input, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Payment, PaymentMethod } from '../../../core/models/payment.model';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyInrPipe, Dialog, Button, Tag],
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent {
  authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private messageService = inject(MessageService);

  id = input<string>('pay_1');

  showPaymentModal = signal<boolean>(false);
  selectedMethod = signal<PaymentMethod>('UPI');
  isProcessing = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);

  invoice: Signal<Payment | undefined> = computed<Payment | undefined>(() =>
    this.paymentService.payments().find((p: Payment) => p.id === this.id()) || this.paymentService.payments()[0]
  );

  printInvoice(): void {
    window.print();
  }

  openPaymentModal(): void {
    this.paymentSuccess.set(false);
    this.showPaymentModal.set(true);
  }

  confirmPayment(): void {
    const inv = this.invoice();
    if (!inv) return;

    this.isProcessing.set(true);
    setTimeout(() => {
      this.paymentService.markAsPaid(inv.id, this.selectedMethod(), `UPI/${Date.now().toString().slice(-8)}/FHUB`);
      this.isProcessing.set(false);
      this.paymentSuccess.set(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Payment Confirmed',
        detail: `Payment for ${inv.invoiceNumber} recorded successfully!`
      });
    }, 600);
  }
}
