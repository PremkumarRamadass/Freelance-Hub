import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ReportService } from '../../core/services/report.service';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let reportService: ReportService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    reportService = TestBed.inject(ReportService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and load financial report summary', () => {
    expect(component).toBeTruthy();
    expect(component.summary()).toBeDefined();
    expect(typeof component.summary().totalCollected).toBe('number');
  });

  it('should provide monthly revenue trends', () => {
    expect(Array.isArray(component.monthlyData())).toBe(true);
  });

  it('should call window.open on exportReport', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.exportReport();
    expect(openSpy).toHaveBeenCalledWith(reportService.exportCsvUrl(), '_blank');
  });
});
