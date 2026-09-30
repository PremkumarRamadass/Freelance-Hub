export interface DocumentItem {
  id: string;
  name: string;
  project: string;
  type: string;
  size: string;
  date: string;
  icon: string;
  url?: string;
  createdAt?: string;
}

export interface CreateDocumentDto {
  name: string;
  project: string;
  type: string;
  size: string;
  date: string;
  icon: string;
  url?: string;
}

export interface BackendDocumentResponse {
  id: string;
  name: string;
  project?: string;
  type?: string;
  size?: string;
  date?: string;
  icon?: string;
  url?: string;
}
