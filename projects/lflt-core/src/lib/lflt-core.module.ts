import { NgModule } from '@angular/core';
import { LeafletServiceModule } from './services/leaflet-service.module';
import { LeafletMapComponent } from './components/leaflet-map/leaflet-map.component';
import {
  LeafletTileLayerDirective,
  LeafletGeoJSONLayerDirective
} from './directives/leaflet-layer.directive';
import { LeafletInteractiveLayerDirective } from './directives/leaflet-interactive-layer.directive';
import {
  LeafletInteractiveObservableLayersDirective,
  LeafletInteractiveObserverLayersDirective
} from './directives/leaflet-interactive-layers.directive';


@NgModule({
  declarations: [
    LeafletMapComponent,
    LeafletTileLayerDirective,
    LeafletGeoJSONLayerDirective,
    LeafletInteractiveLayerDirective,
    LeafletInteractiveObservableLayersDirective,
    LeafletInteractiveObserverLayersDirective
  ],
  imports: [
    LeafletServiceModule
  ],
  exports: [
    LeafletMapComponent,
    LeafletTileLayerDirective,
    LeafletGeoJSONLayerDirective,
    LeafletInteractiveLayerDirective,
    LeafletInteractiveObservableLayersDirective,
    LeafletInteractiveObserverLayersDirective
  ]
})
export class LfltCoreModule { }
