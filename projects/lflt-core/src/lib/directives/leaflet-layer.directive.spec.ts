import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeafletMapComponent } from '../components/leaflet-map/leaflet-map.component';
import {
  LeafletTileLayerDirective,
  LeafletGeoJSONLayerDirective
} from './leaflet-layer.directive';

import { LeafletServiceModule } from '../services/leaflet-service.module';
import { MapFacade } from '../services/map-facade.service';

describe('LeafletTileLayerDirective', () => {
  let mapFacade: MapFacade;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ LeafletServiceModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mapFacade = TestBed.inject(MapFacade);
  });

  it('should create an instance', () => {
    const directive: LeafletTileLayerDirective = new LeafletTileLayerDirective(mapFacade);
    expect(directive).toBeTruthy();
  });
});

describe('LeafletGeoJSONLayerDirective', () => {
  let mapFacade: MapFacade;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ LeafletServiceModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mapFacade = TestBed.inject(MapFacade);
  });

  it('should create an instance', () => {
    const directive: LeafletGeoJSONLayerDirective = new LeafletGeoJSONLayerDirective(mapFacade);
    expect(directive).toBeTruthy();
  });
});
