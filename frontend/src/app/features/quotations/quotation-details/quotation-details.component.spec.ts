import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { QuotationDetailsComponent } from './quotation-details.component';
import { QuotationService } from '../../../core/services/quotation.service';
import { Quotation } from '../../../core/models/quotation.model';

describe('QuotationDetailsComponent', () => {
  let component: QuotationDetailsComponent;
  let fixture: ComponentFixture<QuotationDetailsComponent>;
  let quotationService: QuotationService;
  let messageService: MessageService;

  const mockQuote: Quotation = {
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
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [QuotationDetailsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuotationDetailsComponent);
    component = fixture.componentInstance;
    quotationService = TestBed.inject(QuotationService);
    messageService = TestBed.inject(MessageService);

    (quotationService as any)._quotations.set([mockQuote]);
    fixture.componentRef.setInput('id', 'quot_1');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and load quotation details', () => {
    expect(component).toBeTruthy();
    expect(component.quote()?.quotationNumber).toBe('QT-2026-001');
  });

  it('should approve quotation via quotationService.updateStatus', () => {
    const updateSpy = vi.spyOn(quotationService, 'updateStatus');
    const msgSpy = vi.spyOn(messageService, 'add');

    component.approveQuote();

    expect(updateSpy).toHaveBeenCalledWith('quot_1', 'Accepted');
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(component.feedbackMessage()).toContain('approved successfully');
  });

  it('should send quotation notification message on sendQuote', () => {
    const msgSpy = vi.spyOn(messageService, 'add');
    component.sendQuote();
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });
});
