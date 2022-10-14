import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortLinkComponent } from './short-link.component';

describe('ShortLinkComponent', () => {
  let component: ShortLinkComponent;
  let fixture: ComponentFixture<ShortLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
