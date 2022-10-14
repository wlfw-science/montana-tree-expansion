import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-control-panel-toggle',
  templateUrl: './control-panel-toggle.component.html',
  styleUrls: ['./control-panel-toggle.component.css']
})
export class ControlPanelToggleComponent implements OnInit {

  @Input() position = 'outer-top-right';
  @Input() value = true;
  @Input() type = 'collapse-up';
  @Output() valueChange = new EventEmitter<boolean>();

  on = 'chevron_up';
  off = 'chevron_down';

  constructor() { }

  ontoggle() {
    this.value = !this.value;
    this.valueChange.emit(this.value);
  }

  ngOnInit() {
    switch (this.type) {
      case 'collapse-up':
          this.on = 'up';
          this.off = 'down';
          break;
      case 'collapse-down':
          this.on = 'down';
          this.off = 'up';
          break;
      case 'collapse-left':
          this.on = 'left';
          this.off = 'right';
          break;
      case 'collapse-right':
          this.on = 'right';
          this.off = 'left';
          break;
      default:
          this.on = 'up';
          this.off = 'down';
          break;
    }
  }
}
