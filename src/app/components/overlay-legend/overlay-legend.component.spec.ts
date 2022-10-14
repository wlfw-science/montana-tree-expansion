import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayLegendComponent } from './overlay-legend.component';

describe('OverlayLegendComponent', () => {
  let component: OverlayLegendComponent;
  let fixture: ComponentFixture<OverlayLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverlayLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
