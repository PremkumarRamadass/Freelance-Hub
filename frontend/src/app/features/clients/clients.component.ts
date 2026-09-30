import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { Client, CreateClientDto } from '../../core/models/client.model';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyInrPipe, Dialog, Button, InputText, Tag],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {
  clientService = inject(ClientService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingClientId = signal<string | null>(null);

  clientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    company: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    country: ['India'],
    notes: ['']
  });

  filteredClients = computed(() => {
    const list = this.clientService.clients();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;

    return list.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  });

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingClientId.set(null);
    this.clientForm.reset({
      country: 'India'
    });
    this.showModal.set(true);
  }

  openEditModal(client: Client): void {
    this.isEditing.set(true);
    this.editingClientId.set(client.id);
    this.clientForm.patchValue({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      country: client.country,
      notes: client.notes || ''
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveClient(): void {
    if (this.clientForm.invalid) return;

    const val = this.clientForm.value;

    if (this.isEditing() && this.editingClientId()) {
      const updateDto: Partial<Client> = {
        name: val.name,
        company: val.company,
        email: val.email,
        phone: val.phone,
        country: val.country,
        notes: val.notes
      };

      this.clientService.updateClient(this.editingClientId()!, updateDto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Client Updated',
            detail: `${val.company || val.name} updated successfully!`
          });
          this.closeModal();
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: err.message || 'Could not update client.'
          });
        }
      });
    } else {
      const createDto: CreateClientDto = {
        name: val.name,
        company: val.company,
        email: val.email,
        phone: val.phone,
        country: val.country,
        notes: val.notes
      };

      this.clientService.addClient(createDto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Client Created',
            detail: `${val.company || val.name} added to your client list!`
          });
          this.closeModal();
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Creation Failed',
            detail: err.message || 'Could not create client.'
          });
        }
      });
    }
  }

  deleteClient(id: string, name: string): void {
    if (confirm(`Remove client "${name}"?`)) {
      this.clientService.deleteClient(id).subscribe(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Client Removed',
          detail: `Client ${name} has been removed.`
        });
      });
    }
  }
}
