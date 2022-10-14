import { Component,  HostBinding, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { flyInOut } from '../../constants/animations';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})

@Injectable()
export class ControlPanelComponent  {
 

  public router: Router;
  public panel: string;

  public controlTogglePath( control: string) {
    return this.router.isActive('/' + this.panel + '/' + control, false) ? '../' + this.panel : control;
  }

  constructor() {
  }
}
