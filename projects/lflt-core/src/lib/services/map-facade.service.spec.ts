import { TestBed } from '@angular/core/testing';

import { LfltCoreModule } from '../lflt-core.module';
import { MapFacade } from './map-facade.service';

describe('MapFacade', () => {
  let service: MapFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LfltCoreModule
      ]
    });
    service = TestBed.inject(MapFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
