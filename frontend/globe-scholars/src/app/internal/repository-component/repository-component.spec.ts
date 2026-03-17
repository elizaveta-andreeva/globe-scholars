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

const mockScholar = {
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

describe('RepositoryComponent', () => {
  let component: RepositoryComponent;
  let fixture: ComponentFixture<RepositoryComponent>;
  let repositoryService: jasmine.SpyObj<RepositoryService>;
  let scholarsService: jasmine.SpyObj<ScholarsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const repoSpy = jasmine.createSpyObj('RepositoryService', ['getWorks', 'downloadWork']);
    const scholarsSpy = jasmine.createSpyObj('ScholarsService', ['getScholars']);
    const authSpy = jasmine.createSpyObj('AuthService', [], {isLoggedIn: false});

    repoSpy.getWorks.and.returnValue(of({results: [mockWork], next: null, previous: null}));
    repoSpy.downloadWork.and.returnValue(of(new Blob(['pdf'])));
    scholarsSpy.getScholars.and.returnValue(of({results: [mockScholar], next: null, previous: null}));

    await TestBed.configureTestingModule({
      imports: [RepositoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: RepositoryService, useValue: repoSpy},
        {provide: ScholarsService, useValue: scholarsSpy},
        {provide: AuthService, useValue: authSpy},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RepositoryComponent);
    component = fixture.componentInstance;
    repositoryService = TestBed.inject(RepositoryService) as jasmine.SpyObj<RepositoryService>;
    scholarsService = TestBed.inject(ScholarsService) as jasmine.SpyObj<ScholarsService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadWorks and loadScholars on init', () => {
    spyOn(component, 'loadWorks');
    spyOn(component, 'loadScholars');
    component.ngOnInit();
    expect(component.loadWorks).toHaveBeenCalledWith(component.currentPage);
    expect(component.loadScholars).toHaveBeenCalled();
  });

  it('should load works correctly', () => {
    expect(component.works).toEqual([mockWork]);
    expect(component.hasNext).toBeFalse();
    expect(component.hasPrev).toBeFalse();
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
    Object.defineProperty(authService, 'isLoggedIn', { get: () => true, configurable: true });
    spyOn(router, 'navigate');
    component.openWork(1);
    expect(router.navigate).toHaveBeenCalledWith(['/repository', 1]);
  });

  it('should show login modal when opening work while not logged in', () => {
    Object.defineProperty(authService, 'isLoggedIn', { get: () => false, configurable: true });
    component.openWork(1);
    expect(component.showLoginModal).toBeTrue();
  });

  it('filteredWorks should filter by authorFilterId', () => {
    component.works = [
      {...mockWork, uploader: {id: 1, username: 'john', full_name: 'John Doe', affiliation: 'MIT'}},
      {...mockWork, id: 2, uploader: {id: 2, username: 'alice', full_name: 'Alice Smith', affiliation: 'MIT'}}
    ];
    component.setAuthorFilter(1);
    expect(component.filteredWorks.length).toBe(1);
    expect(component.filteredWorks[0].uploader.id).toBe(1);
  });

  it('filteredWorks should filter by year ranges correctly', () => {
    const now = new Date().getFullYear();
    component.works = [
      {...mockWork, publication_year: now},
      {...mockWork, id: 2, publication_year: now - 5},
      {...mockWork, id: 3, publication_year: now - 10}
    ];
    component.setFilter('last-year');
    expect(component.filteredWorks.every(w => w.publication_year >= now - 1)).toBeTrue();
    component.setFilter('last-5-years');
    expect(component.filteredWorks.every(w => w.publication_year >= now - 5)).toBeTrue();
    component.setFilter('last-10-years');
    expect(component.filteredWorks.every(w => w.publication_year >= now - 10)).toBeTrue();
  });

  it('filteredWorks should sort by upload date descending', () => {
    component.works = [
      {...mockWork, id: 1, uploaded_at: '2023-01-01T00:00:00Z'},
      {...mockWork, id: 2, uploaded_at: '2024-06-01T00:00:00Z'},
    ];
    expect(component.filteredWorks[0].id).toBe(2);
    expect(component.filteredWorks[1].id).toBe(1);
  });
});
