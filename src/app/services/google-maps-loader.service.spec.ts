import { TestBed, inject } from '@angular/core/testing';
import { GoogleMapsLoaderService } from './google-maps-loader.service';

describe('GoogleMapsLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleMapsLoaderService]
    });
  });

  it('should ...', inject([GoogleMapsLoaderService], (service: GoogleMapsLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
