
import { BehaviorSubject  } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MapStateService } from './map-state.service';


const RANGELAND_API_KEY = 'AIzaSyC3e1OYR-d1u3wvxcK8EvrcFCQMvGW2Tzk';

const TREND_CONFIG = {
    annual_cover: {
      endpoint: 'https://rap-api-8ubptl6m.uc.gateway.dev/v3/coverCanada?key=' + RANGELAND_API_KEY,
      propertyResult: 'cover',
      title: '',
      y_axis: 'Cover (%)',
      series: [
        // tslint:disable-next-line:max-line-length
        { name: 'Annual forb & grass cover', id: 'afg', color: '#67000d', type: 'line',   format: {  prefix: '', pattern: '#0', suffix: '%' }, visible: true },
        // tslint:disable-next-line:max-line-length
        { name: 'Perennial forb & grass cover', id: 'pfg', color: '#00441b', type: 'line',   format: { prefix: '', pattern: '#0', suffix: '%' }, visible: true },
        // tslint:disable-next-line:max-line-length
        { name: 'Shrub cover', id: 'shr', type: 'line', color: '#08306b',   format: { prefix: '', pattern: '#0', suffix: '%' }, visible: true },
        // tslint:disable-next-line:max-line-length
        { name: 'Tree cover', id: 'tre', type: 'line', color: '#d36029',   format: { prefix: '', pattern: '#0', suffix: '%' }, visible: true },
        // tslint:disable-next-line:max-line-length
        { name: 'Bare ground cover', id: 'bgr', type: 'line', color: '#fe9929',   format: { prefix: '', pattern: '#0', suffix: '%' }, visible: true },
        // tslint:disable-next-line:max-line-length
        { name: 'Mean annual temp', id: 'annualtemp', color: '#ED44A1', opacity: 0, type: 'bar',  visibleInLegend: false,  format: { prefix: '',pattern: '#0', suffix: '°F' }, visible: false },
        // tslint:disable-next-line:max-line-length
        { name: 'Annual precipitation', id: 'annualprecip', color: '#88A0EE', type: 'bar',   visibleInLegend: true, format: { prefix: '', pattern: '#0', suffix: ' inches' }, visible: true }
      ]
    },
    annual_biomass: {
      endpoint: 'https://rap-api-8ubptl6m.uc.gateway.dev/v3/productionCanada?key=' + RANGELAND_API_KEY,
      propertyResult: 'production',
      title: '',
      y_axis: 'Biomass (kg/ha)',
      series: [
        // tslint:disable-next-line:max-line-length
        { name: 'Annual forb & grass biomass', id: 'afg', color: '#67000d', type: 'line',  format: {  prefix: '', pattern: '#0', suffix: '' }, visible: true },
        // tslint:disable-next-line:max-line-length
        { name: 'Perennial forb & grass biomass', id: 'pfg', color: '#00441b', type: 'line',   format: { prefix: '', pattern: '#0', suffix: '' }, visible: true },
        // tslint:disable-next-line:max-line-length
        { name: 'Herbaceous biomass', id: 'her', color: '#08306b', type: 'line',   format: { prefix: '', pattern: '#0', suffix: '' }, visible: true }

      ]
  },
  biweekly_biomass: {
    endpoint: 'https://rap-api-8ubptl6m.uc.gateway.dev/v3/production16dayCanada?key=' + RANGELAND_API_KEY,
    propertyResult: 'production16day',
    title: '',
    y_axis: 'Biomass (kg/ha)',
    y_range: [0, 2500],
    x_axis_tickformat: '%Y-%m-%d',
    group_by: 'doy',
    waiting_msg: '16-day biomass charts may take up to a minute to generate',
    series: [
      // tslint:disable-next-line:max-line-length
      { name: 'Annual forb & grass biomass', id: 'afg', color: '#67000d', type: 'line',  format: {  prefix: '', pattern: '#0', suffix: '' }, visible: true },
      // tslint:disable-next-line:max-line-length
      { name: 'Annual forb & grass biomass', id: 'afg', color: '#67000d', type: 'line',  format: {  prefix: '', pattern: '#0', suffix: '' }, visible: true },
      // tslint:disable-next-line:max-line-length
      { name: 'Perennial forb & grass biomass', id: 'pfg', color: '#00441b', type: 'line',   format: { prefix: '', pattern: '#0', suffix: '' }, visible: true },
      // tslint:disable-next-line:max-line-length
      { name: 'Herbaceous biomass', id: 'her', color: '#08306b', type: 'line',   format: { prefix: '', pattern: '#0', suffix: '' }, visible: true }

    ]
}
}

@Injectable()
export class AnalysisService {
  public analysis_running: boolean;
  public analysis_complete: boolean;
  public analysis_error_message: String;
  public subtitle: String;
  public geojson: GeoJSON.GeoJsonObject | GeoJSON.FeatureCollection | GeoJSON.Feature | any;
  public polygonID = new BehaviorSubject<string>('');
  public data: google.maps.Data;
  public config = TREND_CONFIG;

  constructor(
    private http: HttpClient,
    private mapState: MapStateService
  ) {
    this.resetDataLayer();
  }

  resetDataLayer() {
    this.data = new google.maps.Data();
    this.data.set('id', 'analysis');
    this.data.setStyle(this.polygonStyleFunction);
  }

  clear() {
    this.mapState.removeDataLayer('analysis');
    this.mapState.setDrawingMode(undefined);
  }

  setPolygon(polygon: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon> | GeoJSON.GeoJsonObject, id?: number) {
   if (polygon) {
      this.geojson = polygon;
      this.analysis_running = false;
      this.analysis_complete = true;
      this.data.forEach(f => this.data.remove(f))
      this.data.addGeoJson(this.geojson);

      this.data.revertStyle();
      this.data.setStyle({
        fillColor: undefined,
        fillOpacity: 0,
        strokeWeight: 2,
        strokeColor: 'black'
      });
      this.mapState.removeDataLayer('analysis');
      this.mapState.setDataLayer(this.data);
    }
  }

  polygonStyleFunction(feature: google.maps.Data.Feature) {
    const vals = []
    return ({
      fillColor: 'grey',
      strokeColor: 'black',
      fillOpacity:  0.8,
      strokeWeight: 0, // (feature.getProperty('selected')) ? 4 : 0,
      strokeOpacity: 0.8 // (feature.getProperty('selected')) ? 1 : 0.8
    });
  }

  calculateAnalysis(mask: boolean) {
    if (this.geojson) {
      this.clear();
      this.analysis_running = true;

      // this.average_geojson = undefined;
      const options = {
        headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8'}),
      };

      this.geojson['properties'] = {
        mask: mask
      }

      const payload = this.geojson;
      this.setPolygon(this.geojson);



    }
  }

  resetAnalysis(clearGeoJSON: boolean, stopDrawing?: boolean) {
    this.analysis_running = false;

    this.geojson = null;
    this.mapState.removeDataLayer('analysis');
    if (clearGeoJSON) {
      this.geojson = undefined;
      this.polygonID.next('');
    }


    this.mapState.setDrawing(undefined);
  }

}
