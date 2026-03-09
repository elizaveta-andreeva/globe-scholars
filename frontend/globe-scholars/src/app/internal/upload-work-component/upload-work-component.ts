import {Component, OnDestroy} from '@angular/core';
import {ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators} from '@angular/forms';
import {RouterModule, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {UploadService} from '../../services/upload/upload-service';
import {interval, Subscription} from 'rxjs';
import {switchMap, takeWhile} from 'rxjs/operators';

@Component({
  selector: 'app-upload-work-component',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './upload-work-component.html',
  styleUrl: './upload-work-component.scss',
})
export class UploadWorkComponent implements OnDestroy {
  uploadForm: FormGroup;
  submitted = false;
  selectedFile: File | null = null;
  fileError: string = '';

  isUploading = false;
  uploadDone = false;
  conversionStatus: string = '';
  conversionProgress: number = 0;

  maxDate = new Date().toISOString().split('T')[0];

  private pollingSubscription: Subscription | null = null;

  constructor(private fb: FormBuilder, private uploadService: UploadService, private router: Router) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      authors: this.fb.array([this.fb.control('', Validators.required)]),
      publicationDate: ['', Validators.required],
      description: ['']
    });
  }

  get authors(): FormArray {
    return this.uploadForm.get('authors') as FormArray;
  }

  addAuthor() {
    this.authors.push(this.fb.control('', Validators.required));
  }

  removeAuthor(index: number) {
    if (this.authors.length > 1) {
      this.authors.removeAt(index);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only .pdf and .docx files are allowed';
      this.selectedFile = null;
    } else {
      this.fileError = '';
      this.selectedFile = file;
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.uploadForm.invalid || !this.selectedFile) {
      if (!this.selectedFile) this.fileError = 'File is required';
      return;
    }

    const values = this.uploadForm.value;
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('authors', values.authors.join(', '));
    formData.append('publication_year', new Date(values.publicationDate).getFullYear().toString());
    formData.append('description', values.description || '');
    formData.append('file', this.selectedFile);

    this.isUploading = true;
    this.conversionProgress = 0;
    this.conversionStatus = 'pending';

    this.uploadService.uploadWork(formData).subscribe({
      next: (res) => {
        this.conversionStatus = res.conversion_status;
        this.conversionProgress = res.conversion_progress;
        this.startPolling(res.id);
      },
      error: (err) => {
        console.log('Upload error:', err.error);
        this.isUploading = false;
        this.fileError = 'Upload failed. Please try again.';
      }
    });
  }

  startPolling(id: number) {
    this.pollingSubscription = interval(500).pipe(
      switchMap(() => this.uploadService.getConversionStatus(id)),
      takeWhile(res => res.conversion_status !== 'completed' && res.conversion_status !== 'failed', true)
    ).subscribe({
      next: (res) => {
        this.conversionStatus = res.conversion_status;
        this.conversionProgress = res.conversion_progress;

        if (res.conversion_status === 'completed') {
          this.conversionProgress = 100;
          setTimeout(() => {
            this.isUploading = false;
            this.uploadDone = true;
            this.resetForm();
            this.router.navigate(['/repository']);
          }, 1500);
        }

        if (res.conversion_status === 'failed') {
          this.isUploading = false;
          this.fileError = 'Conversion failed. Please try again.';
          this.resetForm();
        }
      }
    });
  }

  resetForm() {
    this.uploadForm.reset();
    this.authors.clear();
    this.addAuthor();
    this.selectedFile = null;
    this.submitted = false;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.uploadForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  isAuthorInvalid(index: number): boolean {
    const control = this.authors.at(index);
    return (control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }
}
