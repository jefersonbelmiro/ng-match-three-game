import { TestBed } from '@angular/core/testing';

import { SpriteService } from './sprite.service';

describe('SpriteService', () => {
  let service: SpriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
