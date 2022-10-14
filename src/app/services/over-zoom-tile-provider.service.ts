import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OverZoomTileProviderService {

  MAX_ZOOM = 8;
  DRAW_DEBUG_DATA = false;
  TILE_SIZE = 256;

}
