import { Directive, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import { GeoJsonObject } from 'geojson';
import * as L from 'leaflet';

import { LFLT_MAP_READY } from '../components/leaflet-map/leaflet-map.component';
import { MapFacade, EventPayload, EventInterface } from '../services/map-facade.service';
import { Observable, Subject, zip } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

export const OUTLINE_STYLE: L.PathOptions = { color: '#cccccc', weight: 1, fillOpacity: 0 };

export const BLANK_STYLE: L.PathOptions = {color: '#aaaaaa', weight: 1, fillOpacity: 0};

const LFLT_TILE_LAYER_READY = 'LFLT_TILE_LAYER_READY';
const LFLT_GEOJSON_LAYER_READY = 'LFLT_GEOJSON_LAYER_READY';

/* Reference: https://stackoverflow.com/a/2117523 */
const uuidv4 = (): string =>
  `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c: string) =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
);

@Directive()
export abstract class LeafletReadyAwareDirective implements OnDestroy {

  protected unsubscribe$: Subject<void> = new Subject<void>();
  protected instanceId;

  constructor(
    protected mapFacade: MapFacade,
    protected eventType: string
  ) {
    this.subscribe(eventType);
    this.eventType = eventType;
    this.instanceId = uuidv4();
  }

  private subscribe(eventType: string): void {
    const mapReady$: Observable<EventInterface> = this.mapFacade.event$
    .pipe(
      filter((event: EventInterface): boolean => event.type === LFLT_MAP_READY),
      takeUntil(this.unsubscribe$)
    );

    const layerReady$: Observable<EventInterface> = this.mapFacade.event$
    .pipe(
      filter((event: EventInterface): boolean => event.type === eventType &&
        (event.payload == undefined || event.payload === this.instanceId)
      ),
      takeUntil(this.unsubscribe$)
    );

    zip(mapReady$, layerReady$)
    .subscribe(([mapEvent, layerEvent]: EventInterface[]): void => {
      this.whenReady(mapEvent.payload.map, layerEvent.payload);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  abstract whenReady(map: L.Map, payload?: EventPayload): void;
}

export abstract class LeafletLayer extends LeafletReadyAwareDirective {
  map: L.Map;

  constructor(
    protected mapFacade: MapFacade,
    eventType: string
  ) {
    super(mapFacade, eventType);
  }

  abstract makeLayer(): L.Layer;

  whenReady(map: L.Map): void {
    this.initComponents(map);
  }

  initComponents(map: L.Map): void {
    const layer: L.Layer = this.makeLayer();
    layer.addTo(map);
    console.log(`LeafletLayer::initComponents:${this.eventType} layer added to map`);
  }
}

@Directive({
  selector: 'lflt-tile-layer',
  providers: [{ provide: LeafletLayer, useExisting: LeafletTileLayerDirective }],
})
export class LeafletTileLayerDirective extends LeafletLayer implements OnChanges {

  @Input() urlTemplate: string;
  @Input() options: L.TileLayerOptions;

  constructor(
    mapFacade: MapFacade
  ) {
    super(mapFacade, LFLT_TILE_LAYER_READY);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.urlTemplate && this.urlTemplate) {
      this.mapFacade.broadcast({
        type: this.eventType
      });
    }
  }

  makeLayer(): L.TileLayer {
    const tileLayer: L.TileLayer = L.tileLayer(this.urlTemplate, this.options);
    console.log('LeafletTileLayerDirective::makeLayer: L.TileLayer created');
    return tileLayer;
  }
}

@Directive({
  selector: 'lflt-geojson-layer',
  providers: [{ provide: LeafletLayer, useExisting: LeafletGeoJSONLayerDirective }],
})
export class LeafletGeoJSONLayerDirective extends LeafletLayer implements OnChanges {

  @Input() geojson: GeoJsonObject;
  @Input() options: L.GeoJSONOptions;

  constructor(
    mapFacade: MapFacade
  ) {
    super(mapFacade, LFLT_GEOJSON_LAYER_READY);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.geojson && this.geojson) {
      this.mapFacade.broadcast({
        type: this.eventType,
        payload: this.instanceId
      });
    }
  }

  makeLayer(): L.GeoJSON {
    const layer: L.GeoJSON = L.geoJSON(this.geojson, this.options);
    console.log('LeafletGeoJSONLayerDirective::makeLayer: L.GeoJSON layer created');
    return layer;
  }
}
