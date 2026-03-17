import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Menu} from './menu';
import {provideRouter, Router} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {path: '', pathMatch: 'full', redirectTo: ''},
          {path: 'about', children: []},
          {path: 'login', children: []},
          {path: 'register', children: []},
          {path: 'home/scholars', children: []},
          {path: 'home/repository', children: []},
        ]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a logo', () => {
    const logo = fixture.nativeElement.querySelector('.logo');
    expect(logo).toBeTruthy();
  });

  it('should have a menu', () => {
    const menu = fixture.nativeElement.querySelector('.menu');
    expect(menu).toBeTruthy();
  });

  it('Home link should navigate to landing page', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    fixture.nativeElement.querySelector('a[routerLink="/"]').click();
    await fixture.whenStable();
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('About link should navigate to about page', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['/about']);
    expect(router.url).toEqual('/about');
  });

  it('Scholars link should navigate to scholars page', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['/scholars']);
    expect(router.url).toEqual('/scholars');
  });

  it('Repository link should navigate to repository page', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['/repository']);
    expect(router.url).toEqual('/repository');
  });

  it('Login link should navigate to login page', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['/login']);
    expect(router.url).toEqual('/login');
  });
});
