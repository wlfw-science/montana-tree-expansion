import { TestBed, inject } from '@angular/core/testing';

import { GoogleStyleConverterService } from './google-style-converter.service';

describe('GoogleStyleConverterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleStyleConverterService]
    });
  });

  it('should be created', inject([GoogleStyleConverterService], (service: GoogleStyleConverterService) => {
    expect(service).toBeTruthy();
  }));
});
