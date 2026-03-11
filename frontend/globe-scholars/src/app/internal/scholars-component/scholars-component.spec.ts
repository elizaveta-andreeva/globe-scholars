import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarsComponent } from './scholars-component';
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


describe('ScholarsComponent', () => {
  let component: ScholarsComponent;
  let fixture: ComponentFixture<ScholarsComponent>;

  let scholarsService: jasmine.SpyObj<ScholarsService>;

  beforeEach(async () => {
    const scholarsSpy = jasmine.createSpyObj('ScholarsService', ['getScholarById', 'getScholars']);

    scholarsSpy.getScholarById.and.returnValue(of(mockScholar));
    scholarsSpy.getScholars.and.returnValue(of([mockScholar]));

    await TestBed.configureTestingModule({
      imports: [ScholarsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ScholarsService, useValue: scholarsSpy },
        { provide: ActivatedRoute, useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }}
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

  it('should load scholar on init', () => {
    expect(scholarsService.getScholars).toHaveBeenCalledWith();
    expect(component.scholars).toEqual([mockScholar]);
  })

  it('should load scholars correctly', () => {
    component.loadScholars();
    expect(scholarsService.getScholars).toHaveBeenCalledWith();
    expect(component.scholars).toEqual([mockScholar]);
    expect(component.isLoading).toEqual(false);
  })

  it('should filter scholars based on search term', () => {
    component.scholars = [mockScholar];
    component.searchQuery = 'John';
    expect(component.filteredScholars).toEqual([mockScholar]);
  })

  it('should sort scholars in ascending order', () => {
    const scholar2 = {...mockScholar, id: 2, fullName: 'Alice Smith'};
    component.scholars = [mockScholar, scholar2];
    component.sortAsc = true;
    expect(component.filteredScholars).toEqual([scholar2, mockScholar]);
  })

  it('should navigate to scholar profile on click', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.goToProfile(1);
    expect(router.navigate).toHaveBeenCalledWith(['/home/scholars', 1]);
  })

  it('should toggle sort order', () => {
    component.sortAsc = true;
    component.toggleSort();
    expect(component.sortAsc).toBeFalse();
    component.toggleSort();
    expect(component.sortAsc).toBeTrue();
  })

  it('should set error when loading scholars fails', () => {
    scholarsService.getScholars.and.returnValue(throwError(() => new Error()));
    component.loadScholars();
    expect(component.error).toBe('Failed to load scholars. Please try again.');
    expect(component.isLoading).toBeFalse();
  });
});
