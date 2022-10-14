import { Component, OnInit, Input} from '@angular/core';
import { Overlay } from '../../services/overlays.service';
import { DataLayer } from '../../services/data-layers.service';

@Component({
  selector: 'app-layer-group',
  templateUrl: './layer-group.component.html',
  styleUrls: ['./layer-group.component.css']
})
export class LayerGroupComponent implements OnInit {
  @Input() overlays: (Overlay )[]
  constructor() { }

  ngOnInit() {
  }

}
