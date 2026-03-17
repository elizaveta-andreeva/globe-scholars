import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkSummary, WorkDetail, WorksResponse } from './work.model';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class RepositoryService {
  private apiUrl = `${environment.baseURL}/repository`;

  constructor(private http: HttpClient) {}

  getWorks(page: number = 1, search: string = '', uploader?: number): Observable<any> {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    if (uploader) params.set('uploader', String(uploader));
    return this.http.get(`${this.apiUrl}/?${params}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` }
    });
  }

  getWorkDetail(id: number): Observable<WorkDetail> {
    return this.http.get<WorkDetail>(`${this.apiUrl}/${id}/`);
  }

  downloadWork(id: number): Observable<Blob> {
    const token = sessionStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/${id}/download/`, { headers, responseType: 'blob' });
  }

  addReaction(id: number): Observable<void> {
    const token = sessionStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<void>(`${this.apiUrl}/${id}/react/`, {}, { headers });
  }

  getWorksByUploader(uploaderId: number): Observable<WorkSummary[]> {
    return this.http.get<WorksResponse>(`${this.apiUrl}/?uploader=${uploaderId}`).pipe(
      map(res => res.results)
    );
  }

  deleteWork(id: number): Observable<void> {
    const token = sessionStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}/delete/`, { headers });
  }

}
