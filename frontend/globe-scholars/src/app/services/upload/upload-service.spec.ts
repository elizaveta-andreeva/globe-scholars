import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {UploadResponse, UploadService} from './upload-service';
import {environment} from '../../../environments/environment.development';

describe('UploadService', () => {
  let service: UploadService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.baseURL}/repository`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UploadService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload a work', () => {
    const mockResponse: UploadResponse = {
      id: 1,
      title: 'Test Work',
      conversion_status: 'pending',
      conversion_progress: 0
    };
    const formData = new FormData();
    formData.append('file', new Blob(['test'], {type: 'application/pdf'}), 'test.pdf');

    service.uploadWork(formData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${apiUrl}/upload/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(formData);
    req.flush(mockResponse);
  })

  it('should get conversion status', () => {
    const mockResponse: UploadResponse = {
      id: 1,
      title: 'Test Work',
      conversion_status: 'processing',
      conversion_progress: 50
    };

    service.getConversionStatus(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${apiUrl}/1/conversion-status/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

  });
});
