import { TestBed } from '@angular/core/testing';

import { LfltCoreModule } from '../lflt-core.module';
import { MapFacade } from './map-facade.service';

describe('MapFacade', (): void => {
  let service: MapFacade;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      imports: [
        LfltCoreModule
      ]
    });
    service = TestBed.inject(MapFacade);
  });

  it('should be created', (): void => {
    expect(service).toBeTruthy();
  });
});
