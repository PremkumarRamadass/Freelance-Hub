import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { Payment, CreatePaymentDto } from '../../core/models/payment.model';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, CurrencyInrPipe, Dialog, Button, Tag, InputText],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent {
  authService = inject(AuthService);
  paymentService = inject(PaymentService);
  projectService = inject(ProjectService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  selectedTab = signal<'invoices' | 'payments'>('invoices');
  showModal = signal<boolean>(false);

  invoiceForm: FormGroup = this.fb.group({
    projectId: ['', Validators.required],
    amount: [25000, [Validators.required, Validators.min(100)]],
    dueDate: ['2026-11-15', Validators.required],
    notes: ['Advance Payment']
  });

  openAddModal(): void {
    this.showModal.set(true);
  }

  markPaid(item: Payment): void {
    this.paymentService.markAsPaid(item.id, 'UPI');
    this.messageService.add({
      severity: 'success',
      summary: 'Payment Recorded',
      detail: `Invoice ${item.invoiceNumber} marked as Paid.`
    });
  }

  saveInvoice(): void {
    if (this.invoiceForm.invalid) return;

    const val = this.invoiceForm.value;
    const project = this.projectService.getProjectById(val.projectId);

    const count = this.paymentService.payments().length + 1;
    const invoiceNumber = `INV-${count.toString().padStart(3, '0')}`;

    const dto: CreatePaymentDto = {
      invoiceNumber,
      projectId: val.projectId,
      projectTitle: project ? project.title : 'Project',
      clientId: project ? project.clientId : 'cli_1',
      clientName: project ? project.clientName : 'Client',
      clientCompany: project ? project.clientCompany : 'Company',
      amount: Number(val.amount),
      dueDate: val.dueDate,
      status: 'Pending',
      notes: val.notes
    };

    this.paymentService.createPayment(dto).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Invoice Issued',
        detail: `Invoice ${invoiceNumber} created successfully.`
      });
      this.showModal.set(false);
    });
  }
}
