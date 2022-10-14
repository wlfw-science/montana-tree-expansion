import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlPanelToggleComponent } from './control-panel-toggle.component';

describe('ControlPanelToggleComponent', () => {
  let component: ControlPanelToggleComponent;
  let fixture: ComponentFixture<ControlPanelToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlPanelToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlPanelToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
