import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScholarProfileComponent} from './scholar-profile-component';
import {RepositoryService} from '../../services/repository/repository-service';
import {ScholarsService} from '../../services/scholars/scholars-service';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {WorkSummary} from '../../services/repository/work.model';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const mockWork: WorkSummary = {
  id: 1,
  title: 'Test Work',
  authors: 'John Doe',
  publication_year: 2024,
  file_type: 'pdf',
  file_size: 1000,
  uploaded_at: '2024-01-01T00:00:00Z',
  conversion_status: 'completed',
  uploader: {id: 1, username: 'john', full_name: 'John Doe', affiliation: 'MIT'},
  reaction_count: '0',
  user_has_reacted: 'false'
};

const mockScholar: any = {
  id: 1,
  username: 'john',
  fullName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  bio: '',
  affiliation: 'MIT',
  country: 'USA',
  website: '',
  createdAt: new Date('2024-01-01'),
  uploadCount: 5
};


describe('ScholarProfileComponent', () => {
  let component: ScholarProfileComponent;
  let fixture: ComponentFixture<ScholarProfileComponent>;
  let repositoryService: jasmine.SpyObj<RepositoryService>;
  let scholarsService: jasmine.SpyObj<ScholarsService>;

  beforeEach(async () => {
    const repoSpy = jasmine.createSpyObj('RepositoryService', ['getWorksByUploader']);
    const scholarsSpy = jasmine.createSpyObj('ScholarsService', ['getScholarById', 'exportScholar']);

    repoSpy.getWorksByUploader.and.returnValue(of([mockWork]));
    scholarsSpy.getScholarById.and.returnValue(of(mockScholar));
    scholarsSpy.exportScholar.and.returnValue(of(new Blob(['pdf'], { type: 'application/pdf' })));

    await TestBed.configureTestingModule({
      imports: [ScholarProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: RepositoryService, useValue: repoSpy },
        { provide: ScholarsService, useValue: scholarsSpy },
        { provide: ActivatedRoute, useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScholarProfileComponent);
    component = fixture.componentInstance;
    repositoryService = TestBed.inject(RepositoryService) as jasmine.SpyObj<RepositoryService>;
    scholarsService = TestBed.inject(ScholarsService) as jasmine.SpyObj<ScholarsService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load scholar and works on init', () => {
    expect(scholarsService.getScholarById).toHaveBeenCalledWith(1);
    expect(repositoryService.getWorksByUploader).toHaveBeenCalledWith(1);
    expect(component.scholar).toEqual(mockScholar);
    expect(component.works.length).toBe(1);
    expect(component.works[0].title).toBe('Test Work');
  });

  it('should set error when loading scholar fails', () => {
    scholarsService.getScholarById.and.returnValue(throwError(() => new Error()));
    component.ngOnInit();
    expect(component.error).toBe('Failed to load scholar profile.');
    expect(component.isLoading).toBeFalse();
  });

  it('should set worksLoading to false when loading works fails', () => {
    repositoryService.getWorksByUploader.and.returnValue(throwError(() => new Error()));
    component.loadWorks(1);
    expect(component.worksLoading).toBeFalse();
  });

  it('should calculate year correctly', () => {
    const expectedYear = new Date(mockScholar.createdAt).getFullYear();
    expect(component.getYear(mockScholar.createdAt)).toBe(expectedYear);
  });

  it('should copy profile link to clipboard', async () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    await component.copyProfileLink();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    expect(component.copied).toBeTrue();
  });

  it('should reset copied state after 2 seconds', async () => {
    jasmine.clock().install();
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    await component.copyProfileLink();
    expect(component.copied).toBeTrue();
    jasmine.clock().tick(2001);
    expect(component.copied).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should not download profile if scholar is null', () => {
    component.scholar = null;
    component.downloadProfile();
    expect(scholarsService.exportScholar).not.toHaveBeenCalled();
  });

  it('should download profile', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');
    component.scholar = mockScholar;
    component.downloadProfile();
    expect(scholarsService.exportScholar).toHaveBeenCalledWith(1);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should load works by uploader', () => {
    component.loadWorks(1);
    expect(repositoryService.getWorksByUploader).toHaveBeenCalledWith(1);
    expect(component.works).toEqual([mockWork]);
    expect(component.worksLoading).toBeFalse();
  });

  it('should handle error when downloading profile fails', () => {
    spyOn(console, 'error');
    scholarsService.exportScholar.and.returnValue(throwError(() => new Error()));
    component.scholar = mockScholar;
    component.downloadProfile();
    expect(console.error).toHaveBeenCalledWith('Failed to download profile');
  });
});
