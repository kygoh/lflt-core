import { NgModule } from '@angular/core';
import { LeafletServiceModule } from './services/leaflet-service.module';
import { LeafletMapComponent } from './components/leaflet-map/leaflet-map.component';
import {
  LeafletTileLayerDirective,
  LeafletGeoJSONLayerDirective
} from './directives/leaflet-layer.directive';


@NgModule({
  declarations: [
    LeafletMapComponent,
    LeafletTileLayerDirective,
    LeafletGeoJSONLayerDirective
  ],
  imports: [
    LeafletServiceModule
  ],
  exports: [
    LeafletMapComponent,
    LeafletTileLayerDirective,
    LeafletGeoJSONLayerDirective
  ]
})
export class LfltCoreModule { }
