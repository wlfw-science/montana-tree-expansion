import { TestBed, inject } from '@angular/core/testing';

import { OverZoomTileProviderService } from './over-zoom-tile-provider.service';

describe('OverZoomTileProviderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OverZoomTileProviderService]
    });
  });

  it('should be created', inject([OverZoomTileProviderService], (service: OverZoomTileProviderService) => {
    expect(service).toBeTruthy();
  }));
});
