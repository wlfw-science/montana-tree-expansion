import { Component } from '@angular/core';
import {
  rollUpDown, OnInit, MapStateService, Router
} from '..';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Overlay } from '../../services/overlays.service';
import { HttpClient } from '@angular/common/http';


import { AnalysisService } from '../../services/analysis.service';
import { RoutingService } from '../../services/routing.service';


import { Helpers } from '../../classes/helpers';

import { spinInOut } from '../../constants/animations';
import { LegendOptions } from '../../services/overlays.service';



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
      mapIds: ['right'],
      type: {format: 'XYZ', name: '1950',
      id: 'mt-hist',
      tileurl: 'https://storage.googleapis.com/montana-historical-imagery/v1/{z}/{x}/{y}.png'} ,
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng( 41.005779201292384 ,  -120.60604051826046 ),
          new google.maps.LatLng( 55.12908567856297 ,  -96.300538948688 )),

    }),
    new Overlay({
      id: 'montana-historical-imagery-outlines',
      name: 'Montana Historical Imagery Outlines',
      opacity: 1.0,
      visible: true,
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
    public http: HttpClient,


    private routing: RoutingService,
    public snackBar: MatSnackBar
  ) {

    // initialize range of years supported
    const queryParams = this.router.parseUrl(this.router.url).queryParams;

   }



  updateOverlays() {
    this.overlays.forEach(o => {
      if (o instanceof Overlay) {
        if (o.visible) {
          this.mapState.removeOverlay(o);
          this.mapState.setOverlay(o);
        }
      }
    })

  }


  ngOnInit() {
    this.updateOverlays();


  }
}
