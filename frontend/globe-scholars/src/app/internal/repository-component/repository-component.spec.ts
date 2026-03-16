import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RepositoryComponent} from './repository-component';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter, Router} from '@angular/router';
import {RepositoryService} from '../../services/repository/repository-service';
import {ScholarsService} from '../../services/scholars/scholars-service';
import {AuthService} from '../../services/auth/auth-service';
import {of, throwError} from 'rxjs';
import {WorkSummary} from '../../services/repository/work.model';

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
  createdAt: '2024-01-01',
  uploadCount: 5
};

describe('RepositoryComponent', () => {
  let component: RepositoryComponent;
  let fixture: ComponentFixture<RepositoryComponent>;
  let repositoryService: jasmine.SpyObj<RepositoryService>;
  let scholarsService: jasmine.SpyObj<ScholarsService>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    const repoSpy = jasmine.createSpyObj('RepositoryService', ['getWorks', 'downloadWork']);
    const scholarsSpy = jasmine.createSpyObj('ScholarsService', ['getScholars', 'getScholarById']);

    repoSpy.getWorks.and.returnValue(of({
      results: [mockWork],
      next: null,
      previous: null
    }));
    repoSpy.downloadWork.and.returnValue(of(new Blob(['pdf'])));
    scholarsSpy.getScholars.and.returnValue(of([mockScholar]));
    scholarsSpy.getScholarById.and.returnValue(of(mockScholar));

    await TestBed.configureTestingModule({
      imports: [RepositoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: RepositoryService, useValue: repoSpy},
        {provide: ScholarsService, useValue: scholarsSpy},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RepositoryComponent);
    component = fixture.componentInstance;
    repositoryService = TestBed.inject(RepositoryService) as jasmine.SpyObj<RepositoryService>;
    scholarsService = TestBed.inject(ScholarsService) as jasmine.SpyObj<ScholarsService>;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => sessionStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadWorks and loadScholars on init', () => {
    spyOn(component, 'loadWorks');
    spyOn(component, 'loadScholars');
    component.ngOnInit();
    expect(component.loadWorks).toHaveBeenCalled();
    expect(component.loadScholars).toHaveBeenCalled();
  });

  it('should load works correctly', () => {
    expect(component.works).toEqual([mockWork]);
    expect(component.isLoading).toBeFalse();
  });

  it('should set error when loading works fails', () => {
    repositoryService.getWorks.and.returnValue(throwError(() => new Error()));
    component.loadWorks(1);
    expect(component.error).toBe('Failed to load works.');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading scholars fails', () => {
    scholarsService.getScholars.and.returnValue(throwError(() => new Error()));
    component.scholars = [];
    component.loadScholars();
    expect(component.scholars).toEqual([]);
  });

  it('should download work', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(window.URL, 'revokeObjectURL');
    spyOn(document, 'createElement').and.callThrough();
    component.downloadWork(mockWork);
    expect(repositoryService.downloadWork).toHaveBeenCalledWith(1);
  });

  it('should show login modal when opening work while not logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    component.openWork(1);
    expect(component.showLoginModal).toBeTrue();
  });

  it('should navigate to work when logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('token');
    spyOn(router, 'navigate');
    component.openWork(1);
    expect(router.navigate).toHaveBeenCalledWith(['/home/repository', 1]);
  });

  it('should set active filter', () => {
    component.setFilter('last-year');
    expect(component.activeFilter).toBe('last-year');
  });

  it('filteredWorks should filter by last year', () => {
    const now = new Date().getFullYear();
    component.works = [
      {...mockWork, publication_year: now},
      {...mockWork, id: 2, publication_year: now - 5}
    ];
    component.setFilter('last-year');
    expect(component.filteredWorks.length).toBe(1);
  });

  it('filteredWorks should filter by last 5 years', () => {
    const now = new Date().getFullYear();
    component.works = [
      {...mockWork, publication_year: now - 3},
      {...mockWork, id: 2, publication_year: now - 10}
    ];
    component.setFilter('last-5-years');
    expect(component.filteredWorks.length).toBe(1);
  });

  it('filteredWorks should filter by last 10 years', () => {
    const now = new Date().getFullYear();
    component.works = [
      {...mockWork, publication_year: now - 8},
      {...mockWork, id: 2, publication_year: now - 15}
    ];
    component.setFilter('last-10-years');
    expect(component.filteredWorks.length).toBe(1);
  });

  it('filteredWorks should sort by upload date descending', () => {
    component.works = [
      {...mockWork, id: 1, uploaded_at: '2023-01-01T00:00:00Z'},
      {...mockWork, id: 2, uploaded_at: '2024-06-01T00:00:00Z'},
    ];
    expect(component.filteredWorks[0].id).toBe(2);
  });

  it('filteredWorks should return all works for all-time filter', () => {
    component.works = [mockWork, {...mockWork, id: 2, publication_year: 1990}];
    component.setFilter('all-time');
    expect(component.filteredWorks.length).toBe(2);
  });
});
