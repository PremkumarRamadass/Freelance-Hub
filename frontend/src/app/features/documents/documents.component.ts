import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';
import { CreateDocumentDto } from '../../core/models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {
  documentService = inject(DocumentService);
  documents = this.documentService.documents;

  uploadFile(): void {
    const newDoc: CreateDocumentDto = {
      name: 'Project_Specification_Addendum.pdf',
      project: 'Website Development',
      type: 'PDF',
      size: '1.8 MB',
      date: new Date().toISOString().split('T')[0],
      icon: 'pi-file-pdf'
    };
    this.documentService.addDocument(newDoc).subscribe();
  }
}
