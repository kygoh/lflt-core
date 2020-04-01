import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation, Input } from '@angular/core';

import { MapFacade } from '../../services/map-facade.service';

import * as L from 'leaflet';

export const LFLT_MAP_READY = 'LFLT_MAP_READY';

@Component({
  selector: 'lflt-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: [
    '../../../../../../node_modules/leaflet/dist/leaflet.css',
    './leaflet-map.component.css'
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    MapFacade
  ]
})
export class LeafletMapComponent implements OnInit, AfterViewInit {

  @ViewChild('map', { static: false }) mapContainer: ElementRef<HTMLDivElement>;

  map: L.Map;
  @Input() options: L.MapOptions;

  private mustInvalidate = true;
  private mapContainerDimension: { width: number, height: number };
  private isUpdatingDom = false;

  constructor(
    private mapFacade: MapFacade
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  hasMapContainerDimensionChanged(): boolean {
    return this.mapContainer.nativeElement.offsetWidth !== this.mapContainerDimension.width
      || this.mapContainer.nativeElement.offsetHeight !== this.mapContainerDimension.height;
  }

  mustInvalidateMapSize(): boolean {
    if (this.mustInvalidate) {
      return this.map !== undefined;
    } else {
      return this.hasMapContainerDimensionChanged();
    }
  }

  invalidateMapSize(): void {
    if (!this.isUpdatingDom
       && this.mapContainer.nativeElement.offsetWidth > 0
       && this.mapContainer.nativeElement.offsetHeight > 0) {
        this.isUpdatingDom = true;

        this.map.invalidateSize();
        this.mapContainerDimension = {
          width: this.mapContainer.nativeElement.offsetWidth,
          height: this.mapContainer.nativeElement.offsetHeight
        };
        console.log('LeafletMapComponent::invalidateMapSize', `${this.mapContainerDimension.width}x${this.mapContainerDimension.height}`);

        this.isUpdatingDom = false;

    }
  }

  initMap(): void {
    if (!this.mapContainer) {
      console.warn('Missing div element for map');
      return;
    }
    if (this.mapContainer.nativeElement.offsetWidth === 0) {
      console.warn('div element offsetWidth is 0. ' +
        'Please set width property for div element or initialize map after div element has been rendered');
    }
    if (this.mapContainer.nativeElement.offsetHeight === 0) {
      console.warn('div element offsetHeight is 0. ' +
        'Please set height property for div element or initialize map after div element has been rendered');
    }
    if (this.mapContainer) {
      this.map = L.map(this.mapContainer.nativeElement, this.options);
      this.mapContainerDimension = {
        width: this.mapContainer.nativeElement.offsetWidth,
        height: this.mapContainer.nativeElement.offsetHeight
      };
      console.log('LeafletMapComponent::initMap', `${this.mapContainerDimension.width}x${this.mapContainerDimension.height}`);
      this.mapFacade.broadcast({
        type: LFLT_MAP_READY,
        payload: {
          map: this.map
        }
      });
    }
  }

}
