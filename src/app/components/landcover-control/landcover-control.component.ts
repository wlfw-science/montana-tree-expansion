import { Component } from '@angular/core';
import {
  rollUpDown, OnInit, MapStateService, Router
} from '..';
import { Overlay } from '../../services/overlays.service';
import { BehaviorSubject } from 'rxjs';
import { RoutingService } from '../../services/routing.service';
import { spinInOut } from '../../constants/animations';




@Component({
  selector: 'app-landcover-control',
  templateUrl: './landcover-control.component.html',
  styleUrls: ['./landcover-control.component.css'],
  animations: [ rollUpDown, spinInOut]
})
export class LandcoverControlComponent implements OnInit {

  opacity: number;
  overlay: Overlay;

  featureLayers = {};

  overlays = [new Overlay({
      id: 'montana-historical-imagery',
      name: 'Montana Historical Imagery',
      opacity: 1.0,
      visible: true,
      help: 'Historic imagery',
      side: 'right',
      type: {format: 'XYZ', name: 'Historical Imagery',
      id: 'mt-hist',
      tileurl: 'https://storage.googleapis.com/montana-historical-imagery/v1/{z}/{x}/{y}.png'} ,
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng( 41.005779201292384 ,  -120.60604051826046 ),
          new google.maps.LatLng( 55.12908567856297 ,  -96.300538948688 )),

    }),
    new Overlay({
      id: 'montana-treecover-expansion',
      name: 'Montana Treecover Expansion',
      opacity: 1.0,
      visible: true,
      help: 'Treecover expansion',
      mapIds: ['right'],
      type: {format: 'XYZ', name: 'Treecover Expansion',
      id: 'mt-tree',
      tileurl: 'https://storage.googleapis.com/montana-treecover-expansion/v1/{z}/{x}/{y}.png'} ,
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng( 41.005779201292384 ,  -120.60604051826046 ),
          new google.maps.LatLng( 55.12908567856297 ,  -96.300538948688 )),

    }),


    new Overlay({
      id: 'montana-historical-imagery-outlines',
      name: 'Montana Historical Imagery Outlines',
      opacity: 1.0,
      visible: true,
      showControl: false,
      help: 'Historic imagery',
      mapIds: ['right', 'left'],
      type: {
          name: '1950',
          id: 'mt-hist',
          format: 'MVT',
          tileurl: 'https://storage.googleapis.com/montana-historical-imagery/seamlines/{z}/{x}/{y}.pbf',

        },
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng( 41.005779201292384 ,  -120.60604051826046 ),
        new google.maps.LatLng( 55.12908567856297 ,  -96.300538948688 )),

    })]

  constructor(
    private router: Router,
    public mapState: MapStateService,
  ) {

    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    //this.overlays =

   }



  updateOverlays() {
    this.overlays.forEach(o => {
      if (o instanceof Overlay) {
          this.mapState.overlays.next(this.overlays.map((o) => new BehaviorSubject<Overlay>(o)));
        }
    })

  }


  ngOnInit() {
    this.updateOverlays();


  }
}
