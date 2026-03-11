import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UploadWorkComponent} from './upload-work-component';
import {UploadService} from '../../services/upload/upload-service';
import {provideRouter, Router} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {of, throwError} from 'rxjs';

const mockUploadResponse = {
  id: 1,
  title: 'Test',
  conversion_status: 'pending',
  conversion_progress: 0
};

const mockCompletedResponse = {
  id: 1,
  title: 'Test',
  conversion_status: 'completed',
  conversion_progress: 100
};

const mockFailedResponse = {
  id: 1,
  title: 'Test',
  conversion_status: 'failed',
  conversion_progress: 0
};

describe('UploadWorkComponent', () => {
  let component: UploadWorkComponent;
  let fixture: ComponentFixture<UploadWorkComponent>;
  let uploadService: jasmine.SpyObj<UploadService>;
  let router: Router;

  beforeEach(async () => {
    const uploadSpy = jasmine.createSpyObj('UploadService', ['uploadWork', 'getConversionStatus']);
    uploadSpy.uploadWork.and.returnValue(of(mockUploadResponse));
    uploadSpy.getConversionStatus.and.returnValue(of(mockCompletedResponse));

    await TestBed.configureTestingModule({
      imports: [UploadWorkComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: UploadService, useValue: uploadSpy},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadWorkComponent);
    component = fixture.componentInstance;
    uploadService = TestBed.inject(UploadService) as jasmine.SpyObj<UploadService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => component.ngOnDestroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.uploadForm.get('title')?.value).toBe('');
    expect(component.uploadForm.get('description')?.value).toBe('');
    expect(component.authors.length).toBe(1);
  });

  it('should add author', () => {
    component.addAuthor();
    expect(component.authors.length).toBe(2);
  });

  it('should remove author when more than one', () => {
    component.addAuthor();
    expect(component.authors.length).toBe(2);
    component.removeAuthor(1);
    expect(component.authors.length).toBe(1);
  });

  it('should not remove author when only one', () => {
    component.removeAuthor(0);
    expect(component.authors.length).toBe(1);
  });

  it('should set fileError for invalid file type', () => {
    const event = {target: {files: [new File([''], 'test.txt', {type: 'text/plain'})]}};
    component.onFileChange(event);
    expect(component.fileError).toBe('Only .pdf and .docx files are allowed');
    expect(component.selectedFile).toBeNull();
  });

  it('should accept pdf file', () => {
    const file = new File([''], 'test.pdf', {type: 'application/pdf'});
    const event = {target: {files: [file]}};
    component.onFileChange(event);
    expect(component.fileError).toBe('');
    expect(component.selectedFile).toEqual(file);
  });

  it('should accept docx file', () => {
    const file = new File([''], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const event = {target: {files: [file]}};
    component.onFileChange(event);
    expect(component.fileError).toBe('');
    expect(component.selectedFile).toEqual(file);
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(component.submitted).toBeTrue();
    expect(uploadService.uploadWork).not.toHaveBeenCalled();
  });

  it('should set fileError if no file on submit', () => {
    component.uploadForm.patchValue({title: 'Test', publicationDate: '2024-01-01'});
    component.authors.at(0).setValue('John');
    component.onSubmit();
    expect(component.fileError).toBe('File is required');
  });

  it('should upload work on valid submit', () => {
    component.uploadForm.patchValue({title: 'Test', publicationDate: '2024-01-01'});
    component.authors.at(0).setValue('John');
    component.selectedFile = new File([''], 'test.pdf', {type: 'application/pdf'});
    component.onSubmit();
    expect(uploadService.uploadWork).toHaveBeenCalled();
    expect(component.isUploading).toBeTrue();
  });

  it('should handle upload error', () => {
    uploadService.uploadWork.and.returnValue(throwError(() => ({error: 'Upload failed'})));
    component.uploadForm.patchValue({title: 'Test', publicationDate: '2024-01-01'});
    component.authors.at(0).setValue('John');
    component.selectedFile = new File([''], 'test.pdf', {type: 'application/pdf'});
    component.onSubmit();
    expect(component.isUploading).toBeFalse();
    expect(component.fileError).toBe('Upload failed. Please try again.');
  });

  it('isFieldInvalid should return true for invalid touched field', () => {
    const control = component.uploadForm.get('title');
    control?.markAsTouched();
    expect(component.isFieldInvalid('title')).toBeTrue();
  });

  it('isFieldInvalid should return false for valid field', () => {
    component.uploadForm.get('title')?.setValue('Test');
    expect(component.isFieldInvalid('title')).toBeFalse();
  });

  it('isAuthorInvalid should return true for invalid touched author', () => {
    component.authors.at(0).markAsTouched();
    expect(component.isAuthorInvalid(0)).toBeTrue();
  });

  it('isAuthorInvalid should return false for valid author', () => {
    component.authors.at(0).setValue('John');
    expect(component.isAuthorInvalid(0)).toBeFalse();
  });

  it('should update conversionStatus and progress during polling', () => {
    jasmine.clock().install();
    const processingResponse = {
      id: 1, title: 'Test', conversion_status: 'processing' as const, conversion_progress: 50
    };
    uploadService.getConversionStatus.and.returnValue(of(processingResponse));
    component.startPolling(1);
    jasmine.clock().tick(501);
    expect(component.conversionStatus).toBe('processing');
    expect(component.conversionProgress).toBe(50);
    jasmine.clock().uninstall();
  });

  it('should set progress to 100 on completed', () => {
    jasmine.clock().install();
    uploadService.getConversionStatus.and.returnValue(of(mockCompletedResponse as any));
    component.startPolling(1);
    jasmine.clock().tick(501);
    expect(component.conversionProgress).toBe(100);
    expect(component.conversionStatus).toBe('completed');
    jasmine.clock().uninstall();
  });

  it('should set uploadDone and reset form after completed', () => {
    jasmine.clock().install();
    spyOn(router, 'navigate');
    uploadService.getConversionStatus.and.returnValue(of(mockCompletedResponse as any));
    component.startPolling(1);
    jasmine.clock().tick(501);
    jasmine.clock().tick(1501);
    expect(component.uploadDone).toBeTrue();
    expect(component.isUploading).toBeFalse();
    expect(component.selectedFile).toBeNull();
    expect(component.submitted).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should reset form on failed conversion', () => {
    jasmine.clock().install();
    uploadService.getConversionStatus.and.returnValue(of(mockFailedResponse as any));
    component.selectedFile = new File([''], 'test.pdf');
    component.submitted = true;
    component.startPolling(1);
    jasmine.clock().tick(501);
    expect(component.selectedFile).toBeNull();
    expect(component.submitted).toBeFalse();
    expect(component.authors.length).toBe(1);
    jasmine.clock().uninstall();
  });

  it('resetForm should clear authors and add one empty author', () => {
    component.addAuthor();
    component.addAuthor();
    expect(component.authors.length).toBe(3);
    component.resetForm();
    expect(component.authors.length).toBe(1);
    expect(component.authors.at(0).value).toBe('');
  });

  it('resetForm should reset all form fields', () => {
    component.uploadForm.patchValue({ title: 'Test', description: 'Desc' });
    component.selectedFile = new File([''], 'test.pdf');
    component.submitted = true;
    component.resetForm();
    expect(component.uploadForm.get('title')?.value).toBeNull();
    expect(component.selectedFile).toBeNull();
    expect(component.submitted).toBeFalse();
  });

});
