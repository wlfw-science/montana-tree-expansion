import { Injectable } from '@angular/core';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { Overlay } from './overlays.service';
import { GoogleStyleConverterService } from './google-style-converter.service';
import { SimpleBaseMap } from '../components/map/basemaps.service';
import { DataLayer } from './data-layers.service';
const STATIC_MAP_URL = `https://maps.googleapis.com/maps/api/staticmap`;

@Injectable()
export class MapStateService {

  // TODO switch to BehaviorSubject
  // Observable sources
  private basemapSource = new BehaviorSubject<string|google.maps.MapTypeId|undefined>('roadmap');
  basemap = this.basemapSource.asObservable();

  overlays = new BehaviorSubject<BehaviorSubject<Overlay>[]>([]);

  private clickSource = new Subject<Function>();
  click = this.clickSource.asObservable();

  private zoomSource = new BehaviorSubject<number>(6);
  zoom = this.zoomSource.asObservable();

  bounds = new Subject<google.maps.LatLngBounds>();


  private centerSource = new BehaviorSubject<google.maps.LatLng | undefined>(undefined);
  center = this.centerSource.asObservable();

  private infoWindowSource = new Subject<google.maps.InfoWindow>();
  infoWindow = this.infoWindowSource.asObservable()

  constructor() {
  }

  setClickHandler(handler: Function) { this.clickSource.next(handler); }

  setBasemap(basemap: string | google.maps.MapTypeId | undefined) { this.basemapSource.next(basemap); }
  setZoom(zoom: number | undefined) { if( zoom ) this.zoomSource.next(zoom); }
  setCenter(center?: google.maps.LatLng) { if(center) this.centerSource.next(center); }
  openWindow(window: google.maps.InfoWindow) {
    this.infoWindowSource.next(window)
  }
}
