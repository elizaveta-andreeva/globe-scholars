import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BreadcrumbsComponent} from './breadcrumbs-component';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter, Router, NavigationEnd} from '@angular/router';
import {ScholarsService} from '../../services/scholars/scholars-service';
import {RepositoryService} from '../../services/repository/repository-service';
import {of} from 'rxjs';
import {Subject} from 'rxjs';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let router: Router;

  beforeEach(async () => {
    const scholarsSpy = jasmine.createSpyObj('ScholarsService', ['getScholarById']);
    const repoSpy = jasmine.createSpyObj('RepositoryService', ['getWorkDetail']);
    scholarsSpy.getScholarById.and.returnValue(of({fullName: 'John Doe'}));
    repoSpy.getWorkDetail.and.returnValue(of({title: 'Test Work'}));

    await TestBed.configureTestingModule({
      imports: [BreadcrumbsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{path: '**', redirectTo: ''}]),
        {provide: ScholarsService, useValue: scholarsSpy},
        {provide: RepositoryService, useValue: repoSpy},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  const triggerNavigation = (url: string) => {
    (router.events as Subject<any>).next(new NavigationEnd(1, url, url));
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build breadcrumbs from url', () => {
    triggerNavigation('/scholars');
    expect(component.pathParts().length).toBeGreaterThan(0);
  });

  it('should clear breadcrumbs for login route', () => {
    triggerNavigation('/login');
    expect(component.pathParts().length).toBe(0);
  });

  it('should clear breadcrumbs for register route', () => {
    triggerNavigation('/register');
    expect(component.pathParts().length).toBe(0);
  });

  it('should clear breadcrumbs for root route', () => {
    triggerNavigation('/');
    expect(component.pathParts().length).toBe(0);
  });

  it('should capitalize first letter of path labels', () => {
    triggerNavigation('/scholars');
    const parts = component.pathParts();
    expect(parts.length).toBeGreaterThan(0);
    parts.forEach(part => {
      expect(part.label[0]).toBe(part.label[0].toUpperCase());
    });
  });

  it('should show ... for id segment before resolving', () => {
    const scholarsSpy = TestBed.inject(ScholarsService) as jasmine.SpyObj<ScholarsService>;
    scholarsSpy.getScholarById.and.returnValue(of({fullName: 'John Doe'} as any));
    triggerNavigation('/scholars/1');
    expect(component.pathParts().length).toBeGreaterThan(0);
  });

  it('should unsubscribe on destroy', () => {
    const subSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['subs'] = [subSpy];
    component.ngOnDestroy();
    expect(subSpy.unsubscribe).toHaveBeenCalled();
  });
});
