
const default_opacity = 0.6;

export interface Category {
  label: string;
  color: string;
}
export class LegendOptions {
  constructor(
    public label?: string,
    public min?: string,
    public max?: string,
    public palette?: string[],
    public categories?: Category[]) {}
}
export interface OverlayType {
  id: string;
  name?: string | undefined;
  tileurl: string;
  legend?: LegendOptions | undefined;
  format: 'MVT' | 'XYZ';
}

export interface OverlayParameters {
    opacity?: number;
    params?: any;
    handlers?: {click: Function, mousemove: Function};
    type: OverlayType;
    bounds?: google.maps.LatLngBounds;
    visible?: boolean;
    help?: string;
    years?: number[];
    legend?: LegendOptions;
    name?: string;
    id: string;
    mask?: boolean;
    mapIds?: string[];
}

export class Overlay  {

  public id: string;
  public type: OverlayType = {id: 'none', tileurl: '', format: 'XYZ'};
  public minzoom = 4;
  public maxzoom = 20;
  public maxnativezoom = 16;
  public data: google.maps.Data;
  public tile_params = [];
  public year = 2020;
  public opacity: number;
  public params: any;
  public handlers: {click: Function, mousemove: Function};
  public bounds: google.maps.LatLngBounds;
  public visible: boolean;
  public help: string;
  public years: number[];
  public legend: LegendOptions;
  public name: string;
  public mask: boolean;
  public mapIds: string[];

  constructor(params: OverlayParameters) {
    Object.assign(this, params);
    this.handlers = {
      click: (params.handlers || {click: () => {}}).click,
      mousemove: (params.handlers || {mousemove: () => {}}).mousemove
    };
    this.opacity = (params.opacity || params.opacity === 0) ? params.opacity : default_opacity
    this.config()
 }

 config() {

      if(!this.bounds) {
        this.bounds =  new google.maps.LatLngBounds(
          new google.maps.LatLng( 40.005779201292384 ,  -114.60604051826046 ),
          new google.maps.LatLng( 56.12908567856297 ,  -96.300538948688 ));
        }
  }

}
