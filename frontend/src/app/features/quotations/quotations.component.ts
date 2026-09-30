import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { QuotationService } from '../../core/services/quotation.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/services/auth.service';
import { Quotation, CreateQuotationDto, QuotationClientInfo } from '../../core/models/quotation.model';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, CurrencyInrPipe, Dialog, Button, Tag, InputText],
  templateUrl: './quotations.component.html',
  styleUrl: './quotations.component.scss'
})
export class QuotationsComponent {
  authService = inject(AuthService);
  quotationService = inject(QuotationService);
  clientService = inject(ClientService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  showCreateModal = signal<boolean>(false);

  quoteForm: FormGroup = this.fb.group({
    clientId: ['', Validators.required],
    projectTitle: ['', Validators.required],
    validUntil: ['2026-10-25', Validators.required],
    taxPercent: [18, Validators.required],
    items: this.fb.array([
      this.fb.group({ description: ['UI Development', Validators.required], quantity: [1], rate: [15000] }),
      this.fb.group({ description: ['Backend Development', Validators.required], quantity: [1], rate: [10000] }),
      this.fb.group({ description: ['Payment Integration', Validators.required], quantity: [1], rate: [5000] }),
      this.fb.group({ description: ['Testing', Validators.required], quantity: [1], rate: [5000] })
    ])
  });

  get itemsArray(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  addItem(): void {
    this.itemsArray.push(
      this.fb.group({
        description: ['', Validators.required],
        quantity: [1],
        rate: [5000]
      })
    );
  }

  removeItem(idx: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(idx);
    }
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  previewQuote(q: Quotation): void {
    // Navigate or trigger edit
  }

  deleteQuote(id: string): void {
    if (confirm('Delete quotation?')) {
      this.quotationService.deleteQuotation(id);
      this.messageService.add({
        severity: 'info',
        summary: 'Quotation Deleted',
        detail: 'Quotation was removed.'
      });
    }
  }

  saveQuotation(): void {
    if (this.quoteForm.invalid) return;

    const val = this.quoteForm.value;
    const client = this.clientService.getClientById(val.clientId);

    const clientInfo: QuotationClientInfo = {
      name: client ? client.name : 'Client',
      company: client ? client.company : 'Company',
      email: client ? client.email : 'client@example.com'
    };

    const quoteDto: CreateQuotationDto = {
      clientId: val.clientId,
      projectTitle: val.projectTitle,
      validUntil: val.validUntil,
      taxPercent: Number(val.taxPercent),
      items: val.items
    };

    this.quotationService.createQuotation(quoteDto, clientInfo).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Quotation Created',
          detail: `Quotation for ${val.projectTitle} created successfully.`
        });
        this.showCreateModal.set(false);
      },
      error: (err: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Creation Failed',
          detail: err.message || 'Could not save quotation.'
        });
      }
    });
  }
}
