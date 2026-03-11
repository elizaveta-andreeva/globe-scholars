import {TestBed} from '@angular/core/testing';

import {ScholarsService} from './scholars-service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment.development';
import {provideHttpClient} from '@angular/common/http';

describe('ScholarsService', () => {
  let service: ScholarsService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.baseURL}/auth/scholars`;

  const mockScholar = {
    id: 1,
    username: 'JohnD',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    bio: 'Test bio',
    affiliation: 'MIT',
    country: 'USA',
    website: 'http://johndoe.com',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    uploadCount: 5
  };

  const rawScholar = {
    id: 1,
    username: 'JohnD',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    bio: 'Test bio',
    affiliation: 'MIT',
    country: 'USA',
    website: 'http://johndoe.com',
    created_at: '2024-01-01T00:00:00Z',
    upload_count: 5
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ScholarsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get scholars list', () => {
    service.getScholars().subscribe(scholars => {
      expect(scholars.length).toBe(1);
      expect(scholars[0].fullName).toBe('John Doe');
    });

    const req = httpTestingController.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('GET');
    req.flush({count: 1, next: null, previous: null, results: [rawScholar]});
  });

  it('should get scholar by id', () => {
    service.getScholarById(1).subscribe(scholar => {
      expect(scholar.id).toBe(1);
      expect(scholar.fullName).toBe('John Doe');
    });

    const req = httpTestingController.expectOne(`${apiUrl}/1/`);
    expect(req.request.method).toBe('GET');
    req.flush(rawScholar);
  })

  it('should export scholar data', () => {
    const mockBlob = new Blob(['test data'], {type: 'text/plain'});
    service.exportScholar(1).subscribe(blob => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpTestingController.expectOne(`${apiUrl}/1/export/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should map scholar data correctly', () => {
    const mappedScholar = (service as any).mapScholar(rawScholar);
    expect(mappedScholar).toEqual(mockScholar);
  });
});
