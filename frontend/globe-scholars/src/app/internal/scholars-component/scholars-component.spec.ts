import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScholarsComponent} from './scholars-component';
import {ScholarsService} from '../../services/scholars/scholars-service';
import {of, throwError} from 'rxjs';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';

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

const scholarsResponse = {
  results: [mockScholar],
  next: null,
  previous: null
};

describe('ScholarsComponent', () => {

  let component: ScholarsComponent;
  let fixture: ComponentFixture<ScholarsComponent>;
  let scholarsService: jasmine.SpyObj<ScholarsService>;

  beforeEach(async () => {

    const scholarsSpy = jasmine.createSpyObj('ScholarsService', ['getScholars']);

    scholarsSpy.getScholars.and.returnValue(of(scholarsResponse));

    await TestBed.configureTestingModule({
      imports: [ScholarsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: ScholarsService, useValue: scholarsSpy},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {paramMap: {get: () => '1'}}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScholarsComponent);
    component = fixture.componentInstance;
    scholarsService = TestBed.inject(ScholarsService) as jasmine.SpyObj<ScholarsService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load scholars', () => {

    component.loadScholars();

    expect(scholarsService.getScholars).toHaveBeenCalled();

    expect(component.scholars.length).toBe(1);
    expect(component.scholars[0].fullName).toBe('John Doe');

    expect(component.hasNext).toBeFalse();
    expect(component.hasPrev).toBeFalse();
  });

  it('should navigate to scholar profile on click', () => {

    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.goToProfile(1);

    expect(router.navigate).toHaveBeenCalledWith(['/scholars', 1]);
  });

  it('should toggle sort order', () => {

    component.sortAsc = true;

    component.toggleSort();
    expect(component.sortAsc).toBeFalse();

    component.toggleSort();
    expect(component.sortAsc).toBeTrue();
  });

  it('should set error when loading scholars fails', () => {

    scholarsService.getScholars.and.returnValue(
      throwError(() => new Error('error'))
    );

    component.loadScholars();

    expect(component.error).toBe('Failed to load scholars. Please try again.');
    expect(component.isLoading).toBeFalse();
  });

});
