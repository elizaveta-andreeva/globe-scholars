import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {RepositoryService} from './repository-service';
import {environment} from '../../../environments/environment.development';

describe('RepositoryService', () => {
  let service: RepositoryService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.baseURL}/repository`;

  const mockWorkSummary = {
    id: 1, title: 'Test Work', authors: 'John Doe',
    publication_year: 2024, file_type: 'pdf', file_size: 1000,
    uploaded_at: '2024-01-01', conversion_status: 'completed',
    uploader: {id: 1, username: 'john', full_name: 'John Doe', affiliation: 'MIT'},
    reaction_count: 0, user_has_reacted: false
  };

  const mockWorkDetail = {
    ...mockWorkSummary,
    description: 'Test description', keywords: 'test',
    original_filename: 'test.pdf', updated_at: '2024-01-01',
    download_url: 'http://example.com/download', conversion_progress: 100,
    author_list: ['John Doe']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RepositoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get works list', () => {
    service.getWorks().subscribe(works => {
      expect(works.length).toBe(1);
      expect(works[0].title).toBe('Test Work');
    });

    const req = httpTestingController.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('GET');
    req.flush({count: 1, next: null, previous: null, results: [mockWorkSummary]});
  });

  it('should get work detail', () => {
    service.getWorkDetail(1).subscribe(work => {
      expect(work.id).toBe(1);
      expect(work.description).toBe('Test description');
    });

    const req = httpTestingController.expectOne(`${apiUrl}/1/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockWorkDetail);
  });

  it('should send authorization header on download', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('test-token');

    service.downloadWork(1).subscribe();

    const req = httpTestingController.expectOne(`${apiUrl}/1/download/`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush(new Blob());
  });

  it('should add reaction', () => {
    service.addReaction(1).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`${apiUrl}/1/react/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush({});
  });

  it('should get works by uploader', () => {
    service.getWorksByUploader(5).subscribe(works => {
      expect(works.length).toBe(1);
      expect(works[0].uploader.id).toBe(1);
    });

    const req = httpTestingController.expectOne(`${apiUrl}/?uploader=5`);
    expect(req.request.method).toBe('GET');
    req.flush({count: 1, next: null, previous: null, results: [mockWorkSummary]});
  });

  it('should return empty array when no works found', () => {
    service.getWorks().subscribe(works => {
      expect(works.length).toBe(0);
    });

    const req = httpTestingController.expectOne(`${apiUrl}/`);
    req.flush({count: 0, next: null, previous: null, results: []});
  });

  it('should filter works by uploader id', () => {
    service.getWorksByUploader(99).subscribe();

    const req = httpTestingController.expectOne(`${apiUrl}/?uploader=99`);
    expect(req.request.url).toContain('uploader=99');
    req.flush({count: 0, next: null, previous: null, results: []});
  });
});
