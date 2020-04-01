import { TestBed } from '@angular/core/testing';

import { LfltCoreService } from './lflt-core.service';

describe('LfltCoreService', () => {
  let service: LfltCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LfltCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
