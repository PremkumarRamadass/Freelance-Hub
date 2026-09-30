import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { InvoicesComponent } from './invoices.component';
import { PaymentService } from '../../core/services/payment.service';
import { ProjectService } from '../../core/services/project.service';
import { Payment } from '../../core/models/payment.model';

describe('InvoicesComponent', () => {
  let component: InvoicesComponent;
  let fixture: ComponentFixture<InvoicesComponent>;
  let paymentService: PaymentService;
  let projectService: ProjectService;
  let messageService: MessageService;

  const mockPayments: Payment[] = [
    {
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
    }
  ];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InvoicesComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesComponent);
    component = fixture.componentInstance;
    paymentService = TestBed.inject(PaymentService);
    projectService = TestBed.inject(ProjectService);
    messageService = TestBed.inject(MessageService);

    (paymentService as any)._payments.set(mockPayments);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and switch tabs', () => {
    expect(component).toBeTruthy();
    expect(component.selectedTab()).toBe('invoices');
    component.selectedTab.set('payments');
    expect(component.selectedTab()).toBe('payments');
  });

  it('should mark invoice as paid via paymentService.markAsPaid', () => {
    const markSpy = vi.spyOn(paymentService, 'markAsPaid');
    const msgSpy = vi.spyOn(messageService, 'add');

    component.markPaid(mockPayments[0]);

    expect(markSpy).toHaveBeenCalledWith('pay_1', 'UPI');
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('should open modal and create an invoice', () => {
    const createSpy = vi.spyOn(paymentService, 'createPayment').mockReturnValue(of({} as any));

    component.openAddModal();
    expect(component.showModal()).toBe(true);

    component.invoiceForm.patchValue({
      projectId: 'prj_1',
      amount: 30000,
      dueDate: '2026-11-20',
      notes: 'Phase 1 Payment'
    });

    component.saveInvoice();

    expect(createSpy).toHaveBeenCalled();
    expect(component.showModal()).toBe(false);
  });
});
