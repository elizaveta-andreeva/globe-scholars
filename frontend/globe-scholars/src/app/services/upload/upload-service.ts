import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface UploadResponse {
  id: number;
  title: string;
  conversion_status: 'pending' | 'processing' | 'completed' | 'failed';
  conversion_progress: number;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private apiUrl = `${environment.baseURL}/repository`;

  constructor(private http: HttpClient) {}

  uploadWork(formData: FormData): Observable<UploadResponse> {
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/`, formData);
  }

  getConversionStatus(id: number): Observable<UploadResponse> {
    return this.http.get<UploadResponse>(`${this.apiUrl}/${id}/conversion-status/`);
  }
}
