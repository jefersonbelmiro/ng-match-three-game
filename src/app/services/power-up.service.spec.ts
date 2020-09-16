import { TestBed } from '@angular/core/testing';

import { PowerUpService } from './power-up.service';

describe('PowerUpService', () => {
  let service: PowerUpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerUpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
