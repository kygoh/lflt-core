import {
  Directive,
  Input,
  AfterViewChecked,
  ContentChildren,
  QueryList
} from '@angular/core';
import { LeafletReadyAware, OUTLINE_STYLE } from './leaflet-layer.directive';
import { LeafletInteractiveLayerDirective } from './leaflet-interactive-layer.directive';
import { MapFacade, EventPayload, EventInterface } from '../services/map-facade.service';
import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Feature, GeometryObject, GeoJsonObject, GeoJsonProperties } from 'geojson';
import * as L from 'leaflet';

interface BoundaryHierarchyIntf {
   [key: string]: string;
}

export const LFLT_BOUNDARY_CHANGED = 'LFLT_BOUNDARY_CHANGED';
const LFLT_INTERACTIVE_LAYERS_READY = 'LFLT_INTERACTIVE_LAYERS_READY';

export abstract class LeafletInteractiveLayers extends LeafletReadyAware
 implements AfterViewChecked {

  public selectionProperties: any = {};

  @ContentChildren(LeafletInteractiveLayerDirective) interactiveLayerDirectivesQueryList: QueryList<LeafletInteractiveLayerDirective>;

  @Input() style: L.PathOptions = OUTLINE_STYLE;

  private interactiveLayer: L.GeoJSON;
  private fitBounds: (bounds?: L.LatLngBounds) => void;

  abstract get interactiveLayerDirectives(): QueryList<LeafletInteractiveLayerDirective>;

  get areLayersReady(): boolean {
    const allLayersReady: boolean = !this.interactiveLayerDirectives.some(
      (directive: LeafletInteractiveLayerDirective) => !directive.isReady
    );
    return allLayersReady;
  }

  constructor(
    mapFacade: MapFacade
  ) {
    super(mapFacade, LFLT_INTERACTIVE_LAYERS_READY);
  }

  get event$(): Observable<EventInterface> {
    return this.mapFacade.event$;
  }

  broadcast(event: EventInterface): void {
    this.mapFacade.broadcast(event);
  }

  interactiveLayerDirectiveAt(target: number): LeafletInteractiveLayerDirective {
    return this.interactiveLayerDirectives.find((
      // tslint:disable-next-line:variable-name
      _directive: LeafletInteractiveLayerDirective,
      index: number
    ) => (index === target));
  }

  ngAfterViewChecked(): void {
    // instantiate interactive layer when map is created
    if (this.areLayersReady) {
      this.mapFacade.broadcast({
        type: LFLT_INTERACTIVE_LAYERS_READY
      });
    }
  }

  whenReady(map: L.Map): void {
    console.log(`LeafletInteractiveLayers::whenReady`);
    this.initComponents(map);
  }

  makeLayer(): L.GeoJSON {
    const lastLayer: number = this.interactiveLayerDirectives.length;
    this.interactiveLayer = L.geoJSON(null, {
      onEachFeature: this.onEachFeature,
      filter: this.filter,
      style: this.styleFn
    });
    console.log(`LeafletInteractiveLayers::makeLayer: ${lastLayer} layers created`);
    return this.interactiveLayer;
  }

  private initComponents(map: L.Map): void {
    const layer: L.GeoJSON = this.makeLayer();
    layer.addTo(map);
    map.on('click', (ev: L.LeafletMouseEvent) => {
      console.log(`LeafletInteractiveLayers::initComponents:map.on('click')`);
      this.zoomOut(ev);
    });
    this.fitBounds = (bounds?: L.LatLngBounds): void => {
      map.fitBounds(bounds);
    };
    this.event$
      .pipe(
        filter((event: EventInterface) => !event || event.type === LFLT_BOUNDARY_CHANGED),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event: EventInterface) => {
        const payload: EventPayload = {
          boundaryHierarchy: {},
          bounds: undefined,
          isLastLayer: false,
          ...event?.payload
        };
        this.selectionProperties = payload.boundaryHierarchy;
        const thisLayer: number = Object.keys(this.selectionProperties).length;
        console.log('LeafletInteractiveLayers::event changed', this.selectionProperties, thisLayer);
        this.refreshLayer(payload.bounds);
      });
    this.refreshLayer();
  }

  private onEachFeature = (feature: Feature<GeometryObject, GeoJsonProperties>, layer: L.FeatureGroup): void => {
    const thisLayer: number = Object.keys(this.selectionProperties).length;
    const directive: LeafletInteractiveLayerDirective = this.interactiveLayerDirectiveAt(thisLayer);
    if (directive) {
      const label: string = directive.label;
      if (label && label.length > 0) {
        layer.bindTooltip(feature.properties[label], {
          direction: 'center',
          className: 'lflt-transparent-tooltip',
          permanent: true
        });
      }
    }
    layer.on('click', (ev: L.LeafletMouseEvent) => {
      console.log(`layer.on('click')`);
      this.zoomIn(ev, feature, layer);
    });
  }

  private filter = (feature: Feature<GeometryObject, GeoJsonProperties>): boolean => {
    return Object.keys(this.selectionProperties)
      .every((key: string) => this.selectionProperties[key] === feature.properties[key]);
  }

  private styleFn: L.StyleFunction<GeoJsonProperties> = (
    // tslint:disable-next-line:variable-name
    _feature: Feature<GeometryObject, GeoJsonProperties>
  ): L.PathOptions => {
    const thisLayer: number = Object.keys(this.selectionProperties).length;
    const directive: LeafletInteractiveLayerDirective = this.interactiveLayerDirectiveAt(thisLayer);
    if (directive && directive.style) {
      return directive.style;
    } else {
      // return hasWarnings(feature) ? this.WARNING_STYLE : this.style;
      return this.style;
    }
  }

  private isLastLayer(boundaryHierarchy: any): boolean {
    return this.interactiveLayerDirectives ? Object.keys(boundaryHierarchy).length === this.interactiveLayerDirectives.length :  false;
  }

  private zoomIn(
    ev: L.LeafletMouseEvent,
    feature: Feature<GeometryObject, GeoJsonProperties>,
    layer: L.FeatureGroup
  ): void {
    L.DomEvent.stopPropagation(ev);
    const lastLayer: number = this.interactiveLayerDirectives.length;
    let thisLayer: number = Object.keys(this.selectionProperties).length;
    if (thisLayer >= lastLayer) {
      return;
    }
    ++thisLayer;
    const boundaryHierarchy: BoundaryHierarchyIntf = this.interactiveLayerDirectives
      .reduce((result: any, interactiveLayerDirective: LeafletInteractiveLayerDirective) => {
        const property: string = interactiveLayerDirective.property;
        if (feature.properties[property] !== undefined) {
          result[property] = feature.properties[property];
        }
        return result;
      }, {});
    const bounds: L.LatLngBounds = layer.getBounds();
    const isLastLayer: boolean = this.isLastLayer(boundaryHierarchy);
    this.broadcast({
      type: LFLT_BOUNDARY_CHANGED,
      payload: {
        boundaryHierarchy,
        bounds,
        isLastLayer
      }
    });

    console.log('LeafletInteractiveLayers::zoomIn', thisLayer, 'of', lastLayer, this.selectionProperties);
  }

  private zoomOut(ev: L.LeafletMouseEvent): void {
    L.DomEvent.stopPropagation(ev);
    let thisLayer: number = Object.keys(this.selectionProperties).length;
    if (thisLayer === 0) {
      return;
    }
    const interactiveLayerDirective: LeafletInteractiveLayerDirective = this.interactiveLayerDirectiveAt(thisLayer - 1);
    const key: string = interactiveLayerDirective ? interactiveLayerDirective.property : null;
    console.log(`LeafletInteractiveLayers::Removing selection ${key} at layer ${thisLayer - 1}`);
    if (key != null) {
      const boundaryHierarchy: BoundaryHierarchyIntf = {...this.selectionProperties};
      console.log('LeafletInteractiveLayers::before', boundaryHierarchy);
      delete boundaryHierarchy[key];
      const isLastLayer: boolean = this.isLastLayer(boundaryHierarchy);
      this.broadcast({
        type: LFLT_BOUNDARY_CHANGED,
        payload: {
          boundaryHierarchy,
          bounds: undefined,
          isLastLayer
        }
      });
    }
    --thisLayer;
    const lastLayer: number = this.interactiveLayerDirectives.length;
    console.log('LeafletInteractiveLayers::zoomOut', thisLayer, 'of', lastLayer, this.selectionProperties);
  }

  private refreshLayer(bounds?: L.LatLngBounds): void {
    if (this.interactiveLayerDirectives.length <= 0) {
      return;
    }
    const lastLayer: number = this.interactiveLayerDirectives.length;
    const thisLayer: number = Object.keys(this.selectionProperties).length;
    this.interactiveLayer.clearLayers();
    if (thisLayer < lastLayer) {
      const geojson: GeoJsonObject = this.interactiveLayerDirectiveAt(thisLayer).geojson;
      this.interactiveLayer.addData(geojson);
      bounds = this.interactiveLayer.getBounds();
    }
    this.fitBounds(bounds);
  }

}

@Directive({
  selector: 'lflt-interactive-layers',
  exportAs: 'observable'
})
export class LeafletInteractiveObservableLayersDirective extends LeafletInteractiveLayers
 implements AfterViewChecked {

  get interactiveLayerDirectives(): QueryList<LeafletInteractiveLayerDirective> {
    return this.interactiveLayerDirectivesQueryList;
  }

  constructor(
    mapFacade: MapFacade
  ) {
    super(mapFacade);
  }

  ngAfterViewChecked(): void {
    super.ngAfterViewChecked();
  }

}

@Directive({
  selector: 'lflt-interactive-layers[observable])'
})
export class LeafletInteractiveObserverLayersDirective extends LeafletInteractiveLayers implements AfterViewChecked {

  @Input() observable: LeafletInteractiveObservableLayersDirective;

  get interactiveLayerDirectives(): QueryList<LeafletInteractiveLayerDirective> {
    return this.observable.interactiveLayerDirectivesQueryList;
  }

  constructor(
    mapFacade: MapFacade
  ) {
    super(mapFacade);
  }

  ngAfterViewChecked(): void {
    if (this.areLayersReady) {
      this.observable.event$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event: EventInterface) => {
        super.broadcast(event);
      });

    }
    super.ngAfterViewChecked();
  }

  broadcast(event: EventInterface): void {
    this.observable.broadcast(event);
  }
}