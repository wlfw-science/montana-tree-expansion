import { Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import { Overlay, Router, MapStateService, RoutingService } from '../';


@Component({
  selector: 'app-overlay-toggle-control',
  templateUrl: './overlay-toggle-control.component.html',
  styleUrls: ['./overlay-toggle-control.component.css']
})
export class OverlayToggleControlComponent implements OnInit {

  @Input() overlay: Overlay;
  @Output() overlayChange =  new EventEmitter<Overlay>();

  constructor(private router: Router, private routing: RoutingService, private mapState: MapStateService) {

  }

  public toggleOverlay(event: any) {

    this.overlay.visible = event && event.checked;
    if (this.overlay.visible) {
        this.mapState.setOverlay(this.overlay);
      } else {
        this.mapState.removeOverlay(this.overlay);
    }

    const params : {
      [key: string]: number | string,
     } = {};
    const key: string = this.overlay.id + '_v';
    params[key] = this.overlay.visible ? 'true' : 'false';
    this.routing.updateUrlParams(params);
  }

  ngOnInit() {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    this.overlay.visible = queryParams[this.overlay.id + '_v'] === 'true' || this.overlay.visible ;

    this.toggleOverlay({checked: this.overlay.visible})
  }

}
