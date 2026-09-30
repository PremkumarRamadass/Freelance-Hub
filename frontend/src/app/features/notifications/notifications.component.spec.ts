import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NotificationsComponent } from './notifications.component';
import { NotificationService } from '../../core/services/notification.service';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and provide notification stream', () => {
    expect(component).toBeTruthy();
    expect(Array.isArray(component.notifications())).toBe(true);
  });
});
