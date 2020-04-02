import { async, TestBed } from '@angular/core/testing';

import { LeafletMapComponent } from '../components/leaflet-map/leaflet-map.component';
import {
  LeafletInteractiveObservableLayersDirective,
} from './leaflet-interactive-layers.directive';
import { LeafletServiceModule } from '../services/leaflet-service.module';
import { MapFacade } from '../services/map-facade.service';

import { from } from 'rxjs';

describe('LeafletInteractiveObservableLayersDirective', () => {
  let mapFacade: MapFacade;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LeafletServiceModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mapFacade = TestBed.inject(MapFacade);
  });

  it('should create an instance', () => {
    const observableMapFacade: MapFacade = {} as MapFacade;
    const directive: LeafletInteractiveObservableLayersDirective = new LeafletInteractiveObservableLayersDirective(
      mapFacade
    );
    expect(directive).toBeTruthy();
  });
});
