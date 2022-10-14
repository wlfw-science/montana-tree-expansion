import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MesicControlComponent } from './mesic-control.component';

describe('MesicControlComponent', () => {
  let component: MesicControlComponent;
  let fixture: ComponentFixture<MesicControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MesicControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MesicControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
