import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPage } from './landing-page';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Academic Knowledge Sharing Platform');
  });

  it('should show GET STARTED and LEARN MORE when not logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const texts = Array.from(buttons).map((b: any) => b.textContent.trim());

    expect(texts).toContain('GET STARTED');
    expect(texts).toContain('LEARN MORE');
  });

  it('should show navigation buttons when logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('fake-token');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const texts = Array.from(buttons).map((b: any) => b.textContent.trim());

    expect(texts).toContain('SCHOLARS');
    expect(texts).toContain('REPOSITORY');
    expect(texts).toContain('PROFILE');
    expect(texts).toContain('UPLOAD WORK');
  });

  it('should not show SCHOLARS when not logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const texts = Array.from(buttons).map((b: any) => b.textContent.trim());

    expect(texts).not.toContain('SCHOLARS');
  });

  it('should call login endpoint', () => {
    authService.login('john', 'pass123').subscribe();

    const req = httpMock.expectOne(req => req.url.includes('/auth/login/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'john', password: 'pass123' });
    req.flush({ tokens: { access: 'acc', refresh: 'ref' } });
  });
});
