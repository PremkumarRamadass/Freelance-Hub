import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { QuotationsComponent } from './quotations.component';
import { QuotationService } from '../../core/services/quotation.service';
import { ClientService } from '../../core/services/client.service';
import { Quotation } from '../../core/models/quotation.model';

describe('QuotationsComponent', () => {
  let component: QuotationsComponent;
  let fixture: ComponentFixture<QuotationsComponent>;
  let quotationService: QuotationService;
  let clientService: ClientService;
  let messageService: MessageService;

  const mockQuotes: Quotation[] = [
    {
      id: 'quot_1',
      quotationNumber: 'QT-2026-001',
      clientId: 'cli_1',
      clientName: 'Rahul Sharma',
      clientCompany: 'ABC Pvt Ltd',
      clientEmail: 'rahul@abc.com',
      projectTitle: 'E-Commerce Website',
      items: [{ id: 'item_1', description: 'UI Design', quantity: 1, rate: 20000, amount: 20000 }],
      subtotal: 20000,
      taxPercent: 18,
      taxAmount: 3600,
      discount: 0,
      total: 23600,
      status: 'Sent',
      issueDate: '2026-10-01',
      validUntil: '2026-10-31',
      createdAt: '2026-10-01'
    }
  ];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [QuotationsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuotationsComponent);
    component = fixture.componentInstance;
    quotationService = TestBed.inject(QuotationService);
    clientService = TestBed.inject(ClientService);
    messageService = TestBed.inject(MessageService);

    (quotationService as any)._quotations.set(mockQuotes);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize component', () => {
    expect(component).toBeTruthy();
    expect(component.showCreateModal()).toBe(false);
  });

  it('should add and remove items in the itemsArray', () => {
    const initialLen = component.itemsArray.length;
    component.addItem();
    expect(component.itemsArray.length).toBe(initialLen + 1);

    component.removeItem(component.itemsArray.length - 1);
    expect(component.itemsArray.length).toBe(initialLen);
  });

  it('should open and close create quotation modal', () => {
    component.openCreateModal();
    expect(component.showCreateModal()).toBe(true);

    component.showCreateModal.set(false);
    expect(component.showCreateModal()).toBe(false);
  });

  it('should create quotation via quotationService.createQuotation', () => {
    const createSpy = vi.spyOn(quotationService, 'createQuotation').mockReturnValue(of({} as any));
    const msgSpy = vi.spyOn(messageService, 'add');

    component.quoteForm.patchValue({
      clientId: 'cli_1',
      projectTitle: 'Redesign Project',
      validUntil: '2026-11-15',
      taxPercent: 18
    });

    component.saveQuotation();

    expect(createSpy).toHaveBeenCalled();
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });
});
