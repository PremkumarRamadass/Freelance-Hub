import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { TasksComponent } from './tasks.component';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let taskService: TaskService;
  let messageService: MessageService;

  const mockTasks: Task[] = [
    {
      id: 'task_1',
      projectId: 'prj_1',
      projectName: 'E-Commerce Platform',
      title: 'Design Checkout Flow',
      description: 'Wireframe modern checkout',
      assignee: 'Premkumar',
      dueDate: '2026-10-15',
      priority: 'High',
      status: 'Pending'
    }
  ];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    messageService = TestBed.inject(MessageService);

    (taskService as any)._tasks.set(mockTasks);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize component', () => {
    expect(component).toBeTruthy();
    expect(component.showModal()).toBe(false);
  });

  it('should handle modal opening and editing states', () => {
    component.openAddTaskModal();
    expect(component.showModal()).toBe(true);
    expect(component.isEditing()).toBe(false);

    component.editTask(mockTasks[0]);
    expect(component.showModal()).toBe(true);
    expect(component.isEditing()).toBe(true);
    expect(component.taskForm.get('title')?.value).toBe('Design Checkout Flow');

    component.closeModal();
    expect(component.showModal()).toBe(false);
  });

  it('should toggle task status between Pending and Completed', () => {
    const updateSpy = vi.spyOn(taskService, 'updateTaskStatus');
    const msgSpy = vi.spyOn(messageService, 'add');

    component.toggleStatus(mockTasks[0]);

    expect(updateSpy).toHaveBeenCalledWith('task_1', 'Completed');
    expect(msgSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('should create new task on saveTask', () => {
    const addSpy = vi.spyOn(taskService, 'addTask').mockReturnValue(of({} as any));

    component.taskForm.patchValue({
      title: 'Integrate Payment Gateway',
      description: 'Razorpay integration',
      assignee: 'Premkumar',
      dueDate: '2026-10-20',
      priority: 'High',
      status: 'Pending'
    });

    component.saveTask();

    expect(addSpy).toHaveBeenCalled();
    expect(component.showModal()).toBe(false);
  });
});
