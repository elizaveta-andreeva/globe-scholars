import {TestBed} from '@angular/core/testing';

import {UserProfileService} from './user-profile-service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment.development';
import {provideHttpClient} from '@angular/common/http';
import {UserProfile} from './user-profile.model';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.baseURL}/auth/profile`;
  const changePasswordUrl = `${environment.baseURL}/auth/change-password/`;

  const rawProfile = {
    id: 1,
    username: 'JohnD',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    email: 'johndoe@mail.com',
    bio: 'Test bio',
    affiliation: 'MIT',
    country: 'USA',
    website: 'http://johndoe.com',
    created_at: '2024-01-01T00:00:00Z',
    upload_count: 5,
    total_reactions: 10
  };

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


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserProfileService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user profile', () => {

    service.getProfile().subscribe(profile => {
      expect(profile).toEqual(mockProfile);
    });

    const req = httpTestingController.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('GET');
    req.flush(rawProfile);
  })

  it('should update user profile', () => {
    const updateData = {first_name: 'Jane', last_name: 'Smith'};
    const updatedProfile = {...rawProfile, ...updateData, full_name: 'Jane Smith'};

    service.updateProfile(updateData).subscribe(profile => {
      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
      expect(profile.fullName).toBe('Jane Smith');
    });

    const req = httpTestingController.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(updateData);
    req.flush({user: updatedProfile});
  })

  it('should change password', () => {
    const newPasswordData = {old_password: 'OldPass123', new_password: 'NewPass456', new_password2: 'NewPass456'};

    service.changePassword(newPasswordData).subscribe(response => {
      expect(response).toEqual({message: 'Password changed successfully.'});
    });

    const req = httpTestingController.expectOne(changePasswordUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPasswordData);
    req.flush({message: 'Password changed successfully.'});
  })

  it('should handle error when changing password', () => {
    const newPasswordData = {old_password: 'OldPass123', new_password: 'NewPass456', new_password2: 'NewPass456'};

    service.changePassword(newPasswordData).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: error => {
        expect(error.status).toBe(400);
        expect(error.error).toEqual({old_password: ['Incorrect password.']});
      }
    });

    const req = httpTestingController.expectOne(changePasswordUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPasswordData);
    req.flush({old_password: ['Incorrect password.']}, {status: 400, statusText: 'Bad Request'});
  })

  it('should handle error when updating profile', () => {
    const updateData = {first_name: 'Jane', last_name: 'Smith'};

    service.updateProfile(updateData).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: error => {
        expect(error.status).toBe(400);
        expect(error.error).toEqual({first_name: ['This field is required.']});
      }
    });

    const req = httpTestingController.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(updateData);
    req.flush({first_name: ['This field is required.']}, {status: 400, statusText: 'Bad Request'});
  })

  it('should handle error when fetching profile', () => {
    service.getProfile().subscribe({
      next: () => fail('Expected error, but got success response'),
      error: error => {
        expect(error.status).toBe(401);
        expect(error.error).toEqual({detail: 'Authentication credentials were not provided.'});
      }
    });
    const req = httpTestingController.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('GET');
    req.flush({detail: 'Authentication credentials were not provided.'}, {status: 401, statusText: 'Unauthorized'});
  })

  it('should correctly map raw profile data to UserProfile model', () => {
    const mappedProfile = service['mapProfile'](rawProfile);
    expect(mappedProfile).toEqual(mockProfile);
  })

  it('should use default values when optional fields are missing', () => {
    const minimalProfile = {
      id: 2,
      username: 'jane',
      first_name: 'Jane',
      last_name: 'Smith',
      full_name: 'Jane Smith',
      email: 'jane@mail.com',
      created_at: '2024-01-01T00:00:00Z',
      upload_count: null,
      total_reactions: null,
      bio: null,
      affiliation: null,
      country: null,
      website: null,
    };

    const mapped = service['mapProfile'](minimalProfile);

    expect(mapped.bio).toBe('');
    expect(mapped.affiliation).toBe('');
    expect(mapped.country).toBe('');
    expect(mapped.website).toBe('');
    expect(mapped.uploadCount).toBe(0);
    expect(mapped.totalReactions).toBe(0);
  });
});
