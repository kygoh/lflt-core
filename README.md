# @kygoh/lflt-core

> Angular components and directives for leaflet
> Supports Angular v9

## Table of Contents
TODO


## Install
Install the package and its peer dependencies
```bash
$ npm install @kygoh/lflt-core@0.0.4 --save
$ npm install @types/leaflet leaflet --save
```

## Usage

#### Leaflet map component and tile layer directive

Import the library module in the project's module `app.module.ts`:
```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { LfltCoreModule } from '@kygoh/lflt-core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LfltCoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Skeleton code in `app.component.ts`:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() { }

}
```

Add map component and tile layer directive in `app.component.html`:
```html
<lflt-map class="map-container" [options]="{center: [4.2105, 108.8000], zoom: 6}">
  <lflt-tile-layer
    urlTemplate="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    [options]="{attribution: '&copy; <a href=&#34;https://www.openstreetmap.org/copyright&#34;>OpenStreetMap</a> contributors'}">
  </lflt-tile-layer>
</lflt-map>
```

Add style for the map container in `app.component.scss`:
```scss
.map-container {
    position: absolute;
    top: 0px;
    bottom: 0px;

    width: 100%;
    height: 100%;
}
```

#### Leaflet geojson layer directive

Import the library module and http client module in the project's module `app.module.ts`.
```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { LfltCoreModule } from '@kygoh/lflt-core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LfltCoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Add code to retrieve geojson and json data in `app.component.ts`:
```ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Feature, GeometryObject, GeoJsonProperties } from 'geojson';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  mysAdm1$: Observable<L.GeoJSON>;
  mysAdm2$: Observable<L.GeoJSON>;

  malaysiaParliamentMap$: Observable<L.GeoJSON>;

  private COVID: any;
  private MAPPING: any;

  tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  tileLayerOptions: L.TileLayerOptions = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
                 'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
  };
  geojsonOptions: L.GeoJSONOptions;

  constructor(
    private http: HttpClient,
  ) {
  }

  async ngOnInit() {
    this.COVID = await this.getJSON('assets/data/covid.json').toPromise();
    this.MAPPING = await this.getJSON('assets/data/district-mapping.json').toPromise();
    this.geojsonOptions = {
      style: this.style,
      onEachFeature: this.onEachFeature
    };
    this.mysAdm1$ = this.getGeoJSON('assets/data/mys_adm1.geojson');
    this.mysAdm2$ = this.getGeoJSON('assets/data/mys_adm2_mod.geojson');
    this.malaysiaParliamentMap$ = this.getGeoJSON('assets/data/malaysia_parliamentary_carto_2018.geojson');
  }

  getGeoJSON(url: string): Observable<L.GeoJSON> {
    return this.http.get<L.GeoJSON>(url);
  }

  getJSON(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  highlightFeature = (e) => {
    const layer = e.target;

    console.log(layer.feature.properties);
    const cases = this.getCases(layer.feature.properties.parliament);
    const mapped = this.MAPPING[layer.feature.properties.parliament];
    layer.bindTooltip(
      `${layer.feature.properties.parliament}<br>${mapped ? mapped + '<br>' : ''}${cases ? cases : 'no'} case(s)`
    ).openTooltip();
  }

  resetHighlight = (e) => {
    const layer = e.target;

    layer.unbindTooltip();
  }

  onEachFeature = (feature: Feature<GeometryObject, GeoJsonProperties>, layer: L.Layer) => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight
    });
  }

  style = (feature: Feature<GeometryObject, GeoJsonProperties>): L.PathOptions => {
    return {
      fillColor: this.getColor(feature.properties.parliament),
      weight: 0.25,
      opacity: 1.0,
      color: 'red',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  getCases = (location: string): number => {
    let d = this.COVID[location.toUpperCase()];
    if (d === undefined) {
      d = this.COVID[this.MAPPING[location]];
    }
    return d;
  }

  getColor = (location: string): string => {
    const d = this.getCases(location);
    return d > 200 ? '#800026' :
           d > 100 ? '#BD0026' :
           d > 80  ? '#E31A1C' :
           d > 40  ? '#FC4E2A' :
           d > 20  ? '#FD8D3C' :
           d > 10  ? '#FEB24C' :
           d > 5   ? '#FED976' :
           d > 0   ? '#FFEDA0' :
                     '#fafafa';
  }
}
```

Add the components and directives to draw the geojson data in `app.component.html`:
```html
<lflt-map class="map-container" [options]="{center: [4.2105, 108.8000], zoom: 6}">

  <lflt-tile-layer [urlTemplate]="tileLayerUrl" [options]="tileLayerOptions"></lflt-tile-layer>

  <lflt-geojson-layer [geojson]="malaysiaParliamentMap$ | async" [options]="geojsonOptions">
  </lflt-geojson-layer>

</lflt-map>
```

Add style for the map container in `app.component.scss`:
```scss
.map-container {
    position: absolute;
    top: 0px;
    bottom: 0px;

    width: 100%;
    height: 100%;
}
```

## Credits
**[Leaflet](http://leafletjs.com/)