import { TestBed, inject } from '@angular/core/testing';

import { MercatorProjection } from './projection.service';

describe('MercatorProjection', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MercatorProjection]
    });
  });

  it('should ...', inject([MercatorProjection], (service: MercatorProjection) => {
    expect(service).toBeTruthy();
  }));
});
