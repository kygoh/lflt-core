import { Directive, Input } from '@angular/core';

import { GeoJsonObject } from 'geojson';
import { PathOptions } from 'leaflet';

@Directive({
  selector: 'lflt-interactive-layers > lflt-interactive-layer'
})
export class LeafletInteractiveLayerDirective {

  @Input() property: string;
  @Input() label: string;
  @Input() geojson: GeoJsonObject;
  @Input() style: PathOptions;

  get isReady(): boolean {
    return !!this.geojson;
  }

  constructor() {}

}
