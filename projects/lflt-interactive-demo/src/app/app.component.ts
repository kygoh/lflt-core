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
  singaporeMap$: Observable<L.GeoJSON>;

  private COVID: any;
  private MAPPING: any;

  tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  tileLayerOptions: L.TileLayerOptions = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
                 'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
  };
  geojsonOptions: L.GeoJSONOptions;
  sgpGeojsonOptions: L.GeoJSONOptions = {
    attribution: '<a href="https://github.com/yinshanyang/singapore">Singapore</a>',
    style: { color: 'red', weight: 0.25, dashArray: '3', fill: false }
  };

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
    this.singaporeMap$ = this.getGeoJSON('assets/data/sgp_adm1.geojson');
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
      attribution: '<a href="https://data.humdata.org/dataset/malaysia-administrative-level-0-2-boundaries">Malaysia - Subnational Administrative Boundaries</a>, <a href="https://daneshtindak.carto.com/tables/malaysia_parliamentary_carto_2018/public/map">malaysia_parliamentary_carto_2018</a>',
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
