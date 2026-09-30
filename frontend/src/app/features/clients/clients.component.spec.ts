import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ClientsComponent } from './clients.component';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let clientService: ClientService;
  let messageService: MessageService;

  const mockClients: Client[] = [
    {
      id: 'client-1',
      name: 'Rahul Sharma',
      company: 'Acme Corp',
      email: 'rahul@acme.com',
      phone: '9876543210',
      country: 'India',
      status: 'Active',
      totalBilled: 50000,
      projectsCount: 2,
      createdAt: '2026-01-01'
    },
    {
      id: 'client-2',
      name: 'Sarah Connor',
      company: 'Cyberdyne Systems',
      email: 'sarah@cyberdyne.com',
      phone: '9876543211',
      country: 'USA',
      status: 'Active',
      totalBilled: 75000,
      projectsCount: 1,
      createdAt: '2026-01-02'
    }
  ];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    clientService = TestBed.inject(ClientService);
    messageService = TestBed.inject(MessageService);
    // Mock clients list
    (clientService as any)._clients.set(mockClients);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and show all clients', () => {
    expect(component).toBeTruthy();
    expect(component.filteredClients().length).toBe(2);
  });

  it('should filter clients by search query', () => {
    component.searchQuery.set('cyberdyne');
    expect(component.filteredClients().length).toBe(1);
    expect(component.filteredClients()[0].company).toBe('Cyberdyne Systems');

    component.searchQuery.set('nonexistent');
    expect(component.filteredClients().length).toBe(0);
  });

  it('should open and configure Add Client modal', () => {
    component.openAddModal();
    expect(component.showModal()).toBe(true);
    expect(component.isEditing()).toBe(false);
    expect(component.editingClientId()).toBeNull();
    expect(component.clientForm.get('country')?.value).toBe('India');
  });

  it('should open and populate Edit Client modal', () => {
    component.openEditModal(mockClients[0]);
    expect(component.showModal()).toBe(true);
    expect(component.isEditing()).toBe(true);
    expect(component.editingClientId()).toBe('client-1');
    expect(component.clientForm.get('company')?.value).toBe('Acme Corp');
  });

  it('should close modal when closeModal is called', () => {
    component.openAddModal();
    expect(component.showModal()).toBe(true);
    component.closeModal();
    expect(component.showModal()).toBe(false);
  });

  it('should create a new client via clientService.addClient', () => {
    const addSpy = vi.spyOn(clientService, 'addClient').mockReturnValue(of({} as any));
    const msgSpy = vi.spyOn(messageService, 'add');

    component.openAddModal();
    component.clientForm.patchValue({
      name: 'New Client',
      company: 'New Tech Inc',
      email: 'tech@new.com',
      phone: '1234567890'
    });

    component.saveClient();

    expect(addSpy).toHaveBeenCalled();
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(component.showModal()).toBe(false);
  });
});
