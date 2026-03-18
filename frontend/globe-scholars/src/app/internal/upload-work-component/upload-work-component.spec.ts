import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {UploadWorkComponent} from './upload-work-component';
import {UploadService} from '../../services/upload/upload-service';
import {provideRouter, Router} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const mockUploadResponse = {
  id: 1,
  title: 'Test',
  conversion_status: 'pending' as const,
  conversion_progress: 0
};

const mockCompletedResponse = {
  id: 1,
  title: 'Test',
  conversion_status: 'completed' as const,
  conversion_progress: 100
};

const mockFailedResponse = {
  id: 1,
  title: 'Test',
  conversion_status: 'failed' as const,
  conversion_progress: 0
};

describe('UploadWorkComponent', () => {
  let component: UploadWorkComponent;
  let fixture: ComponentFixture<UploadWorkComponent>;
  let uploadService: jasmine.SpyObj<UploadService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const uploadSpy = jasmine.createSpyObj('UploadService', ['uploadWork', 'getConversionStatus']);
    uploadSpy.uploadWork.and.returnValue(of(mockUploadResponse));
    uploadSpy.getConversionStatus.and.returnValue(of(mockCompletedResponse));

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UploadWorkComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: UploadService, useValue: uploadSpy},
        {provide: Router, useValue: routerSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadWorkComponent);
    component = fixture.componentInstance;
    uploadService = TestBed.inject(UploadService) as jasmine.SpyObj<UploadService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {
    expect(component.uploadForm.get('title')?.value).toBe('');
    expect(component.uploadForm.get('description')?.value).toBe('');
    expect(component.authors.length).toBe(1);
  });

  it('should add and remove authors correctly', () => {
    component.addAuthor();
    expect(component.authors.length).toBe(2);

    component.removeAuthor(1);
    expect(component.authors.length).toBe(1);

    component.removeAuthor(0);
    expect(component.authors.length).toBe(1);
  });

  it('should validate file type', () => {
    const invalidFile = new File([''], 'test.txt', {type: 'text/plain'});
    component.onFileChange({target: {files: [invalidFile]}});
    expect(component.fileError).toBe('Only .pdf and .docx files are allowed');
    expect(component.selectedFile).toBeNull();

    const pdfFile = new File([''], 'file.pdf', {type: 'application/pdf'});
    component.onFileChange({target: {files: [pdfFile]}});
    expect(component.fileError).toBe('');
    expect(component.selectedFile).toEqual(pdfFile);

    const docxFile = new File([''], 'file.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    component.onFileChange({target: {files: [docxFile]}});
    expect(component.fileError).toBe('');
    expect(component.selectedFile).toEqual(docxFile);
  });

  it('should not submit if form invalid', () => {
    component.onSubmit();
    expect(component.submitted).toBeTrue();
    expect(uploadService.uploadWork).not.toHaveBeenCalled();
  });

  it('should submit valid form and start polling', fakeAsync(() => {
    component.uploadForm.patchValue({title: 'Test', publicationDate: '2024-01-01'});
    component.authors.at(0).setValue('John');
    component.selectedFile = new File([''], 'file.pdf', {type: 'application/pdf'});

    component.onSubmit();
    expect(uploadService.uploadWork).toHaveBeenCalled();
    expect(component.isUploading).toBeTrue();

    tick(1000);
    expect(component.conversionStatus).toBe('completed');
    expect(component.conversionProgress).toBe(100);

    tick(1500);
    expect(component.isUploading).toBeFalse();
    expect(component.uploadDone).toBeTrue();
    expect(component.selectedFile).toBeNull();
    expect(component.submitted).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/repository']);
  }));

  it('should handle upload error', () => {
    uploadService.uploadWork.and.returnValue(throwError(() => ({error: 'fail'})));
    component.uploadForm.patchValue({title: 'Test', publicationDate: '2024-01-01'});
    component.authors.at(0).setValue('John');
    component.selectedFile = new File([''], 'file.pdf', {type: 'application/pdf'});

    component.onSubmit();
    expect(component.isUploading).toBeFalse();
    expect(component.fileError).toBe('Upload failed. Please try again.');
  });

  it('should reset form correctly', () => {
    component.addAuthor();
    component.uploadForm.patchValue({title: 'Test', description: 'Desc'});
    component.selectedFile = new File([''], 'file.pdf');
    component.submitted = true;

    component.resetForm();
    expect(component.uploadForm.get('title')?.value).toBeNull();
    expect(component.uploadForm.get('description')?.value).toBeNull();
    expect(component.selectedFile).toBeNull();
    expect(component.submitted).toBeFalse();
    expect(component.authors.length).toBe(1);
    expect((component.authors.at(0) as any).value).toBe('');
  });

  it('isFieldInvalid and isAuthorInvalid should work', () => {
    component.uploadForm.get('title')?.markAsTouched();
    expect(component.isFieldInvalid('title')).toBeTrue();

    component.uploadForm.get('title')?.setValue('Test');
    expect(component.isFieldInvalid('title')).toBeFalse();

    component.authors.at(0).markAsTouched();
    expect(component.isAuthorInvalid(0)).toBeTrue();

    component.authors.at(0).setValue('John');
    expect(component.isAuthorInvalid(0)).toBeFalse();
  });
});
