import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { prettyPrintJson } from 'pretty-print-json';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})

export class LayoutComponent  {
  /*
   * The main routed component
   */


  public basemap = google.maps.MapTypeId.HYBRID;
  public featureData: {[key: string]: {[key:string]: number | string}};
  public context: {center:google.maps.LatLng | undefined, zoom: number | undefined, source: string} =
    {center: new google.maps.LatLng(47.8, -112.65), zoom:15, source: ''};

  constructor() {

  }
  public handleClick(event: {[key: string]: {[key:string]: number | string}}) {

    this.featureData = event;
  }
}
