import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DocumentsComponent } from './documents.component';
import { DocumentService } from '../../core/services/document.service';

describe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;
  let documentService: DocumentService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DocumentsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    documentService = TestBed.inject(DocumentService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and display documents', () => {
    expect(component).toBeTruthy();
    expect(Array.isArray(component.documents())).toBe(true);
  });

  it('should upload a new document via documentService.addDocument', () => {
    const addSpy = vi.spyOn(documentService, 'addDocument').mockReturnValue(of({} as any));
    component.uploadFile();
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Project_Specification_Addendum.pdf',
      type: 'PDF'
    }));
  });
});
