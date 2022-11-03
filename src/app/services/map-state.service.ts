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


  private overlaysSource = new BehaviorSubject<Overlay[]>([]);
  overlays = this.overlaysSource.asObservable();


  private clickSource = new Subject<Function>();
  click = this.clickSource.asObservable();






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




  setClickHandler(handler: Function) { this.clickSource.next(handler); }


  setOverlay(overlay: Overlay | DataLayer, idx?: number) {
    if (overlay && overlay instanceof Overlay) {
      const overlays = this.overlaysSource.getValue();
      this.removeOverlay(overlay);
      overlays.splice(idx ? idx : overlays.length, 0, overlay);
      this.overlaysSource.next(overlays);
    }
  }
  removeOverlay(overlay: Overlay) {
    if(overlay) {
      const overlays = this.overlaysSource.getValue();
      this.overlaysSource.next(overlays.filter(o => o.id !== overlay.id));
    }
  }
  refresh() {
    const overlays = this.overlaysSource.getValue();
    this.overlaysSource.next([]);
    this.overlaysSource.next(overlays);
  }
  setBasemap(basemap: string | google.maps.MapTypeId | undefined) { this.basemapSource.next(basemap); }
  setZoom(zoom: number | undefined) { if( zoom ) this.zoomSource.next(zoom); }
  setBounds(bounds: google.maps.LatLngBounds | undefined) { if(bounds) {this.boundsSource.next(bounds);} }
  setCenter(center?: google.maps.LatLng) { if(center) this.centerSource.next(center); }
  openWindow(window: google.maps.InfoWindow) {
    this.infoWindowSource.next(window)
  }
}
