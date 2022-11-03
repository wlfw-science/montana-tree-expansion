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
  public leftToggle = true;
  public rightToggle = true;
  public leftBasemap = google.maps.MapTypeId.SATELLITE;
  public rightBasemap = google.maps.MapTypeId.SATELLITE;
  public featureData = {};
  public tabIndex = 0;
  public context: {center:google.maps.LatLng | undefined, zoom: number | undefined, source: string} =
    {center: new google.maps.LatLng(47.8, -112.65), zoom:15, source: ''};

  constructor(
    private router: Router,
    private routing: RoutingService,
  ) {
    this.routing.url.subscribe(u => u ||
      this.router.navigateByUrl('') )
    const params = this.routing.getParams();
    if (params['tab']) {
      this.tabIndex = params['tab'];
    }

  }
  public handleClick(event: any) {
    console.log(event)
    this.featureData = prettyPrintJson.toHtml(
      event,
      {lineNumbers: true});
    }
}
