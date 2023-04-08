import { Component,  EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Overlay, Router} from '../';
import { RoutingService } from '../../services/routing.service';
import { MapStateService } from '../../services/map-state.service';

@Component({
  selector: 'app-opacity-control',
  templateUrl: './opacity-control.component.html',
  styleUrls: ['./opacity-control.component.css']
})
export class OpacityControlComponent implements OnInit {

  @Input() overlay: Overlay;
  @Output() overlayChange =  new EventEmitter<Overlay>();

  constructor(private router: Router, private routing: RoutingService, private mapState: MapStateService) { }

  public setOpacity(event: any) {
    if (event.value >= 0) {
      this.overlay.opacity = event.value / 100;
      const params: {[key:string]: string | number} = {};
      params[this.overlay.id + '_o'] = this.overlay.opacity;
      if (this.overlay.visible) {
        let overlaySubject = this.mapState.overlays.getValue().find(o => o.getValue().id === this.overlay.id);
        overlaySubject?.next(this.overlay);
      }
      this.routing.updateUrlParams(params);
    }
  }

  ngOnInit() {
    const params = this.router.parseUrl(this.router.url).queryParams
    this.overlay.opacity = parseFloat(params[this.overlay.id + '_o']) || this.overlay.opacity || 0.6;
    if (this.overlay.visible) {
      //this.mapState.setOverlay(this.overlay);
    }
  }

}
