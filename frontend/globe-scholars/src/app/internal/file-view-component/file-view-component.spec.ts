import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FileViewComponent} from './file-view-component';
import {ActivatedRoute} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {RepositoryService} from '../../services/repository/repository-service';
import {of, throwError} from 'rxjs';

const mockWork = {
  id: 1,
  title: 'Test Work',
  authors: 'John Doe',
  author_list: ['John Doe'],
  publication_year: 2024,
  file_type: 'pdf',
  file_size: 1000,
  uploaded_at: '2024-01-01',
  updated_at: '2024-01-01',
  conversion_status: 'completed',
  conversion_progress: 100,
  uploader: {id: 1, username: 'john', full_name: 'John Doe', affiliation: 'MIT'},
  reaction_count: '5',
  user_has_reacted: false,
  description: 'Test',
  keywords: 'test',
  original_filename: 'test.pdf',
  download_url: 'http://example.com/download'
};

describe('FileViewComponent', () => {
  let component: FileViewComponent;
  let fixture: ComponentFixture<FileViewComponent>;
  let repositoryService: jasmine.SpyObj<RepositoryService>;

  beforeEach(async () => {
    const repoSpy = jasmine.createSpyObj('RepositoryService', [
      'getWorkDetail', 'downloadWork', 'addReaction'
    ]);

    repoSpy.getWorkDetail.and.returnValue(of(mockWork));
    repoSpy.downloadWork.and.returnValue(of(new Blob(['pdf'], {type: 'application/pdf'})));
    repoSpy.addReaction.and.returnValue(of({}));

    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake-url');
    spyOn(URL, 'revokeObjectURL');

    await TestBed.configureTestingModule({
      imports: [FileViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: RepositoryService, useValue: repoSpy},
        {
          provide: ActivatedRoute, useValue: {
            snapshot: {paramMap: {get: () => '1'}}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileViewComponent);
    component = fixture.componentInstance;
    repositoryService = TestBed.inject(RepositoryService) as jasmine.SpyObj<RepositoryService>;
    fixture.detectChanges();
  });

  afterEach(() => sessionStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load work detail on init', () => {
    expect(repositoryService.getWorkDetail).toHaveBeenCalledWith(1);
    expect(component.work).toEqual(mockWork as any);
  });

  it('should load pdf after work detail is loaded', () => {
    expect(repositoryService.downloadWork).toHaveBeenCalledWith(1);
    expect(component.downloadURL).toBe('blob:fake-url');
    expect(component.isLoading).toBeFalse();
  });

  it('should set error when getWorkDetail fails', () => {
    repositoryService.getWorkDetail.and.returnValue(throwError(() => new Error()));
    component.ngOnInit();
    expect(component.error).toBe('Failed to load work details.');
    expect(component.isLoading).toBeFalse();
  });

  it('should set error when downloadWork fails', () => {
    repositoryService.downloadWork.and.returnValue(throwError(() => new Error()));
    component.ngOnInit();
    expect(component.error).toBe('Failed to load file.');
    expect(component.isLoading).toBeFalse();
  });

  it('canReact should return false when not logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    expect(component.canReact).toBeFalse();
  });

  it('canReact should return false when user already reacted', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('fake-token');
    component.work = {...mockWork, user_has_reacted: true} as any;
    expect(component.canReact).toBeFalse();
  });

  it('canReact should return false when user is the uploader', () => {
    spyOn(sessionStorage, 'getItem').and.callFake((key) =>
      key === 'access_token' ? 'token' : 'john'
    );
    component.work = {...mockWork, user_has_reacted: false} as any;
    expect(component.canReact).toBeFalse();
  });

  it('canReact should return true for other logged in users', () => {
    spyOn(sessionStorage, 'getItem').and.callFake((key) =>
      key === 'access_token' ? 'token' : 'otheruser'
    );
    component.work = {...mockWork, user_has_reacted: false} as any;
    expect(component.canReact).toBeTrue();
  });

  it('should call addReaction and update reaction count', () => {
    spyOn(sessionStorage, 'getItem').and.callFake((key) =>
      key === 'access_token' ? 'token' : 'otheruser'
    );
    component.work = {...mockWork, user_has_reacted: false, reaction_count: '5'} as any;
    component.react();
    expect(repositoryService.addReaction).toHaveBeenCalledWith(1);
    expect(component.work?.reaction_count).toBe('6');
    expect(component.work?.user_has_reacted).toBe('true');
  });

  it('should not call addReaction when canReact is false', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    component.react();
    expect(repositoryService.addReaction).not.toHaveBeenCalled();
  });
});
