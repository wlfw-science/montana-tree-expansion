import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreecoverExpansionControlComponent } from './treecover-expansion-control.component';

describe('TreecoverExpansionControlComponent', () => {
  let component: TreecoverExpansionControlComponent;
  let fixture: ComponentFixture<TreecoverExpansionControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreecoverExpansionControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreecoverExpansionControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
