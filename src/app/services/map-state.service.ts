import { Injectable } from '@angular/core';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { Overlay } from './overlays.service';
import { GoogleStyleConverterService } from './google-style-converter.service';
import { SimpleBaseMap } from '../components/map/basemaps.service';
import * as shp from 'shpjs';
import { DataLayer } from './data-layers.service';
import { stringify } from 'querystring';
import { OverlayToggleControlComponent } from '../components/overlay-toggle-control/overlay-toggle-control.component';

const STATIC_MAP_URL = `https://maps.googleapis.com/maps/api/staticmap`;

@Injectable()
export class MapStateService {

  // TODO switch to BehaviorSubject
  // Observable sources
  private basemapSource = new BehaviorSubject<string|google.maps.MapTypeId|undefined>('roadmap');
  basemap = this.basemapSource.asObservable();


  private overlaysSource = new BehaviorSubject<Overlay[]>([]);
  overlays = this.overlaysSource.asObservable();

  private dataLayersSource = new Subject<google.maps.Data[]>();
  public dataLayerArr: google.maps.Data[] = [];
  dataLayers = this.dataLayersSource.asObservable();

  private dataLayerStylesSource = new Subject<{
    id: string, style: google.maps.Data.StylingFunction
  }>();
  public dataLayerStyles = this.dataLayerStylesSource.asObservable();

  private geojsonSource = new BehaviorSubject<GeoJSON.GeoJsonObject | undefined>(undefined);
  geojson = this.geojsonSource.asObservable();

  private clickSource = new Subject<Function>();
  click = this.clickSource.asObservable();

  private drawSource = new Subject<Function>();
  draw = this.drawSource.asObservable();

  private drawingModeSource = new Subject<google.maps.drawing.OverlayType | undefined>();
  drawingMode = this.drawingModeSource.asObservable();

  private mousemoveSource = new Subject<Function>();
  mousemove = this.mousemoveSource.asObservable();

  private zoomSource = new BehaviorSubject<number>(6);
  zoom = this.zoomSource.asObservable();

  private boundsSource = new Subject<google.maps.LatLngBounds>();
  bounds = this.boundsSource.asObservable();

  private centerSource = new BehaviorSubject<google.maps.LatLng | undefined>(undefined);
  center = this.centerSource.asObservable();

  private infoWindowSource = new Subject<google.maps.InfoWindow>();
  infoWindow = this.infoWindowSource.asObservable()

  constructor(private styleConverter: GoogleStyleConverterService) {
    // populate overlays with available layers.
    // ensures only one overlay can be active at a time. Tracked by various
    // toggle switches.
    /*this.overlay.subscribe(
      o => Object.keys(this.overlays).map(
        k => this.overlays[k] = (k === (o || { name: '' }).name)));
    */
  }

  public staticMapUrl(width?: number, height?: number, polygon?: google.maps.Data) {
    const center = this.centerSource.getValue() || new google.maps.LatLng(43, -110),
      lat = center.lat(), lng = center.lng(),
      zoom = this.zoomSource.getValue(),
      maptype = this.basemapSource.getValue(),
      mapstyle = this.styleConverter.get_static_style(new SimpleBaseMap().style);

    const url = `https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyA2IbdH4K2g-lhlBj9J5DLSRyO9EZ8HZQE&` +
      `center=${lat},${lng}&zoom=${zoom}&scale=2&` +
      `size=${(width ||1024)/ 2}x${(height || 1024) / 2}&maptype=${maptype}&${mapstyle}` ;
      return url;
  }


  setClickHandler(handler: Function) { this.clickSource.next(handler); }

  setDataLayer(layer: google.maps.Data) {
    if (!this.dataLayerArr.find(l => (l.get('id') === layer.get('id')) && l.get('id') && layer.get('id'))) {
      this.dataLayerArr.push(layer);
    }
    this.dataLayersSource.next(this.dataLayerArr);
  }
  removeDataLayer(id: string) {
    this.dataLayerArr.filter(l => l.get('id') === id).map(l => l.setMap(null));
    this.dataLayerArr = this.dataLayerArr.filter(l => l.get('id') !==id);
    this.dataLayersSource.next(this.dataLayerArr);
  }

  clearMap() {
    this.dataLayerArr.forEach(l => this.removeDataLayer(l.get('id')) )
    this.overlaysSource.next([])
  }

  setDataLayerStyle(id: string, style: google.maps.Data.StylingFunction) {
    this.dataLayerStylesSource.next({ id: id, style: style })
  }
  setOpacity(id: string, opacity: number) {

  }

  setOverlay(overlay: Overlay | DataLayer, idx?: number) {
    if (overlay && overlay instanceof Overlay) {
      const overlays = this.overlaysSource.getValue();
      this.removeOverlay(overlay);
      overlays.splice(idx ? idx : overlays.length, 0, overlay);
      this.overlaysSource.next(overlays);
    }
    if (overlay && overlay instanceof DataLayer && overlay.name && overlay.url && overlay.style) {
      this.removeDataLayer(overlay.name)
      fetch(overlay.url)
        .then(r => r.arrayBuffer())
        .then(a => shp.parseZip(a))
        .then(geojson => {
            const data = new google.maps.Data();
        data.addGeoJson(geojson);
        data.set('id', overlay.name);
        data.setStyle(overlay.style? overlay.style : null);
        this.setDataLayer(data)
      })
    }
  }
  removeOverlay(overlay: Overlay) {
    if(overlay) {
      const overlays = this.overlaysSource.getValue();
      this.overlaysSource.next(overlays.filter(o => o.id !== overlay.id));
      this.removeDataLayer(overlay.id);
    }
  }
  refresh() {
    const overlays = this.overlaysSource.getValue();
    this.overlaysSource.next([]);
    this.overlaysSource.next(overlays);
  }
  setDrawing(geojson: GeoJSON.GeoJsonObject | undefined) { this.geojsonSource.next(geojson); }
  setBasemap(basemap: string | google.maps.MapTypeId | undefined) { this.basemapSource.next(basemap); }
  setDrawHandler(handler: Function) { this.drawSource.next(handler); }
  setMouseMoveHandler(handler: Function) { this.mousemoveSource.next(handler); }
  setZoom(zoom: number | undefined) { if( zoom ) this.zoomSource.next(zoom); }
  setBounds(bounds: google.maps.LatLngBounds | undefined) { if(bounds) {this.boundsSource.next(bounds);} }
  setCenter(center?: google.maps.LatLng) { if(center) this.centerSource.next(center); }
  setDrawingMode(mode: google.maps.drawing.OverlayType | undefined) { this.drawingModeSource.next(mode); }
  openWindow(window: google.maps.InfoWindow) {
    this.infoWindowSource.next(window)
  }
}
