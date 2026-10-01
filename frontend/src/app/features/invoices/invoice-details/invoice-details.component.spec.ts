import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InvoiceDetailsComponent } from './invoice-details.component';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';

describe('InvoiceDetailsComponent', () => {
  let component: InvoiceDetailsComponent;
  let fixture: ComponentFixture<InvoiceDetailsComponent>;
  let paymentService: PaymentService;
  let messageService: MessageService;

  const mockPayment: Payment = {
    id: 'pay_1',
    invoiceNumber: 'INV-001',
    projectId: 'prj_1',
    projectTitle: 'E-Commerce Platform',
    clientId: 'cli_1',
    clientName: 'Rahul Sharma',
    clientCompany: 'ABC Pvt Ltd',
    amount: 45000,
    dueDate: '2026-10-15',
    status: 'Pending',
    createdAt: '2026-10-01'
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailsComponent);
    component = fixture.componentInstance;
    paymentService = TestBed.inject(PaymentService);
    messageService = TestBed.inject(MessageService);

    (paymentService as any)._payments.set([mockPayment]);
    fixture.componentRef.setInput('id', 'pay_1');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and load invoice by id', () => {
    expect(component).toBeTruthy();
    expect(component.invoice()?.invoiceNumber).toBe('INV-001');
  });

  it('should open payment modal', () => {
    component.openPaymentModal();
    expect(component.showPaymentModal()).toBe(true);
    expect(component.paymentSuccess()).toBe(false);
  });

  it('should process payment on confirmPayment', () => {
    vi.useFakeTimers();
    const markSpy = vi.spyOn(paymentService, 'markAsPaid');
    const msgSpy = vi.spyOn(messageService, 'add');

    component.confirmPayment();
    expect(component.isProcessing()).toBe(true);

    vi.advanceTimersByTime(700);

    expect(markSpy).toHaveBeenCalled();
    expect(component.isProcessing()).toBe(false);
    expect(component.paymentSuccess()).toBe(true);
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    vi.useRealTimers();
  });
});
