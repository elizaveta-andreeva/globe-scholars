import { TestBed } from '@angular/core/testing';

import { ScholarsService } from './scholars-service';

describe('ScholarsService', () => {
  let service: ScholarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScholarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
