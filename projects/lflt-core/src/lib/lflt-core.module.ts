import { NgModule } from '@angular/core';
import { LeafletServiceModule } from './services/leaflet-service.module';
import { LeafletMapComponent } from './components/leaflet-map/leaflet-map.component';


@NgModule({
  declarations: [
    LeafletMapComponent
  ],
  imports: [
    LeafletServiceModule
  ],
  exports: [
    LeafletMapComponent
  ]
})
export class LfltCoreModule { }
