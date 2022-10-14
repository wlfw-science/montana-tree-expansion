export interface DataLayerOptions {
   id: string;
   name?: string;
   visible?: boolean;
   url?: string;
   style?: google.maps.Data.StyleOptions | google.maps.Data.StylingFunction;
}

export class  DataLayer {
  public handlers: any;
  public bounds: google.maps.LatLngBounds;
  public id: number;
  public minzoom = 4;
  public maxzoom = 17;
  public name?: string;
  public visible?: boolean;
  public url?: string;
  public style?: google.maps.Data.StyleOptions | google.maps.Data.StylingFunction;

  constructor(args: DataLayerOptions){
    Object.assign(this, args);
  }
}

