import { Component, OnInit, ElementRef} from '@angular/core';
import { MapStateService, Overlay } from '..';

@Component({
  selector: 'app-treecover-expansion-control',
  templateUrl: './treecover-expansion-control.component.html',
  styleUrls: ['./treecover-expansion-control.component.css']
})
export class TreecoverExpansionControlComponent implements OnInit {
  overlay: Overlay;

  constructor(private mapState: MapStateService, public element: ElementRef) { }

  ngOnInit(): void {
    this.mapState.overlays.subscribe(
      (overlays) => {
        let overlay = overlays.find((o)=> o.value.id === 't')?.value;

        if(overlay) {
          this.overlay = overlay;
        }
      }
    );
  }
}
