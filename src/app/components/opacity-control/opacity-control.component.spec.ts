import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpacityControlComponent } from './opacity-control.component';

describe('OpacityControlComponent', () => {
  let component: OpacityControlComponent;
  let fixture: ComponentFixture<OpacityControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpacityControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpacityControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
