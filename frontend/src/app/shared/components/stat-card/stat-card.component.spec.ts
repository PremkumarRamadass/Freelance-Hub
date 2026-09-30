import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Total Revenue');
    fixture.componentRef.setInput('value', '₹1,50,000');
    fixture.componentRef.setInput('icon', 'pi pi-wallet');
    fixture.detectChanges();
  });

  it('should create and render inputs', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Total Revenue');
    expect(component.value()).toBe('₹1,50,000');
    expect(component.icon()).toBe('pi pi-wallet');
  });

  it('should apply optional inputs properly', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.componentRef.setInput('trend', '+12.5%');
    fixture.componentRef.setInput('trendPositive', true);
    fixture.componentRef.setInput('subtitle', 'vs last month');
    fixture.detectChanges();

    expect(component.variant()).toBe('success');
    expect(component.trend()).toBe('+12.5%');
    expect(component.trendPositive()).toBe(true);
    expect(component.subtitle()).toBe('vs last month');
  });
});
