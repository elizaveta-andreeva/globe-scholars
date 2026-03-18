import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UserProfileComponent} from './user-profile-component';
import {UserProfileService} from '../../services/user-profile/user-profile-service';
import {provideRouter, Router} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {of, throwError} from 'rxjs';
import {UserProfile} from '../../services/user-profile/user-profile.model';

const mockProfile: UserProfile = {
  id: 1,
  username: 'JohnD',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  email: 'johndoe@mail.com',
  bio: 'Test bio',
  affiliation: 'MIT',
  country: 'USA',
  website: 'http://johndoe.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  uploadCount: 5,
  totalReactions: 10
};

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let profileService: jasmine.SpyObj<UserProfileService>;
  let router: Router;

  beforeEach(async () => {
    const profileSpy = jasmine.createSpyObj('UserProfileService', ['getProfile', 'updateProfile', 'changePassword']);
    profileSpy.getProfile.and.returnValue(of(mockProfile));
    profileSpy.updateProfile.and.returnValue(of(mockProfile));
    profileSpy.changePassword.and.returnValue(of({message: 'Password changed.'}));

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: UserProfileService, useValue: profileSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    profileService = TestBed.inject(UserProfileService) as jasmine.SpyObj<UserProfileService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => sessionStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(profileService.getProfile).toHaveBeenCalled();
    expect(component.profile).toEqual(mockProfile);
    expect(component.isLoading).toBeFalse();
  });

  it('should set error when loading profile fails', () => {
    profileService.getProfile.and.returnValue(throwError(() => new Error()));
    component.ngOnInit();
    expect(component.error).toBe('Failed to load profile.');
    expect(component.isLoading).toBeFalse();
  });

  it('should populate form on resetForm', () => {
    expect(component.form.username).toBe('JohnD');
    expect(component.form.first_name).toBe('John');
    expect(component.form.last_name).toBe('Doe');
    expect(component.form.email).toBe('johndoe@mail.com');
  });

  it('should not reset form if profile is null', () => {
    component.profile = null;
    component.form = {};
    component.resetForm();
    expect(component.form).toEqual({});
  });

  it('should start editing', () => {
    component.saveSuccess = true;
    component.startEditing();
    expect(component.isEditing).toBeTrue();
    expect(component.saveSuccess).toBeFalse();
  });

  it('should cancel editing and reset form', () => {
    component.isEditing = true;
    component.cancelEditing();
    expect(component.isEditing).toBeFalse();
    expect(component.form.username).toBe('JohnD');
  });

  it('should save profile successfully', () => {
    component.saveProfile();
    expect(profileService.updateProfile).toHaveBeenCalled();
    expect(component.isEditing).toBeFalse();
    expect(component.isSaving).toBeFalse();
    expect(component.saveSuccess).toBeTrue();
  });

  it('should reset saveSuccess after 3 seconds', () => {
    jasmine.clock().install();
    component.saveProfile();
    jasmine.clock().tick(3001);
    expect(component.saveSuccess).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should handle save profile error', () => {
    profileService.updateProfile.and.returnValue(throwError(() => new Error()));
    component.saveProfile();
    expect(component.isSaving).toBeFalse();
  });

  it('should cancel changing password', () => {
    component.isChangingPassword = true;
    component.passwordError = 'error';
    component.cancelChangingPassword();
    expect(component.isChangingPassword).toBeFalse();
    expect(component.passwordError).toBeNull();
    expect(component.passwordForm.get('old_password')?.value).toBeNull();
  });

  it('should not save password if form is invalid', () => {
    component.savePassword();
    expect(profileService.changePassword).not.toHaveBeenCalled();
  });

  it('should set error if passwords do not match', () => {
    component.passwordForm.patchValue({
      old_password: 'OldPass1',
      new_password: 'NewPass1',
      new_password2: 'DifferentPass1'
    });
    component.savePassword();
    expect(component.passwordError).toBe('Passwords do not match.');
  });

  it('should save password successfully', () => {
    component.passwordForm.patchValue({
      old_password: 'OldPass1',
      new_password: 'NewPass1',
      new_password2: 'NewPass1'
    });
    component.savePassword();
    expect(profileService.changePassword).toHaveBeenCalled();
    expect(component.isChangingPassword).toBeFalse();
    expect(component.passwordSuccess).toBeTrue();
  });

  it('should reset passwordSuccess after 3 seconds', () => {
    jasmine.clock().install();
    component.passwordForm.patchValue({
      old_password: 'OldPass1',
      new_password: 'NewPass1',
      new_password2: 'NewPass1'
    });
    component.savePassword();
    jasmine.clock().tick(3001);
    expect(component.passwordSuccess).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should handle change password error', () => {
    profileService.changePassword.and.returnValue(
      throwError(() => ({error: {error: 'Incorrect password.'}}))
    );
    component.passwordForm.patchValue({
      old_password: 'WrongPass1',
      new_password: 'NewPass1',
      new_password2: 'NewPass1'
    });
    component.savePassword();
    expect(component.passwordError).toBe('Incorrect password.');
  });

  it('should not copy if profile is null', () => {
    spyOn(navigator.clipboard, 'writeText');
    component.profile = null;
    component.copyProfileLink();
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('should reset copied after 2 seconds', async () => {
    jasmine.clock().install();
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    component.copyProfileLink();
    jasmine.clock().tick(2001);
    expect(component.copied).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should logout and navigate to login', () => {
    sessionStorage.setItem('access_token', 'token');
    sessionStorage.setItem('refresh_token', 'refresh');
    spyOn(router, 'navigate');
    component.logout();
    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
