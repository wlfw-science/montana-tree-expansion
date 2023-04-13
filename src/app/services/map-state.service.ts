import { Injectable, OnInit} from '@angular/core';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { Overlay } from './overlays.service';

@Injectable()
export class MapStateService {
  basemap = new BehaviorSubject<string|google.maps.MapTypeId>('satellite');
  overlays = new BehaviorSubject<BehaviorSubject<Overlay>[]>([]);
  zoom = new BehaviorSubject<number>(6);
  bounds = new Subject<google.maps.LatLngBounds>();
  center = new BehaviorSubject<google.maps.LatLng | undefined>(undefined);
  infoWindow =new Subject<google.maps.InfoWindow>();

  constructor() {

  }
}
