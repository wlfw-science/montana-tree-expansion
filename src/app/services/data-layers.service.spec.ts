import { TestBed, inject } from '@angular/core/testing';

import { DataLayersService } from './data-layers.service';

describe('DataLayersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataLayersService]
    });
  });

  it('should be created', inject([DataLayersService], (service: DataLayersService) => {
    expect(service).toBeTruthy();
  }));
});
