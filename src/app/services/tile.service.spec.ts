import { TestBed } from '@angular/core/testing';

import { BuildTileService } from './build-tile.service';

describe('BuildTileService', () => {
  let service: BuildTileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildTileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
