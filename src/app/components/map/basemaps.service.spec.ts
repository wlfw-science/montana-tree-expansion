import { TestBed, inject } from '@angular/core/testing';
import { SimpleBaseMap } from './basemaps.service';

describe('SimpleBaseMap', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimpleBaseMap]
    });
  });

  it('should ...', inject([SimpleBaseMap], (service: SimpleBaseMap) => {
    expect(service).toBeTruthy();
  }));
});
