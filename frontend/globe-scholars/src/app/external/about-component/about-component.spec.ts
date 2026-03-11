import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AboutComponent} from './about-component';
import {provideRouter} from '@angular/router';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the about page content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('About Our Platform');
    expect(compiled.querySelector('p')?.textContent).toContain('Academic Knowledge Sharing Platform is designed to help students, researchers, and educators collaborate and exchange knowledge efficiently.');
  })

});
