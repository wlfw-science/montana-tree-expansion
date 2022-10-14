
import { Component, Input, OnChanges,  ChangeDetectorRef, AfterViewInit, ViewChild, EventEmitter, ElementRef, Output, SimpleChanges } from '@angular/core';
import { SimpleBaseMap } from './basemaps.service';
import { Overlay} from '../../services/overlays.service';
import { MapStateService } from '../../services/map-state.service';
import { fromUrl, fromUrls, Pool } from 'geotiff';
import { GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps/typed';
import {GeoJsonLayer} from '@deck.gl/layers/typed';
import {MVTLayer} from '@deck.gl/geo-layers/typed';
import {BitmapLayer} from '@deck.gl/layers/typed';
import {TileLayer, TileLayerProps, _Tile2DHeader, GeoBoundingBox} from '@deck.gl/geo-layers/typed';
import { prettyPrintJson } from 'pretty-print-json';


const globalMaxZoom = 20;
const globalMinZoom = 4;

export interface OverlayMapTypeOptions {
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  maxNativeZoom: number;
  getTileUrl: (tileCoord: google.maps.Point, zoom: number) => string;
  tileSize: google.maps.Size;
}

export class STACMapType implements google.maps.MapType {

  public alt: string;
  public minZoom: number;
  public maxZoom: number;
  public name: string;
  public projection: google.maps.Projection;
  public radius: number;
  public tileSize: google.maps.Size | null;

  constructor(private pool: Pool) {

  }

  tileCache: {[key:string]: any } = {}
  getTile(tileCoord: google.maps.Point | null, zoom: number, ownerDocument: Document | null): Element | null;
  getTile(tileCoord: google.maps.Point, zoom: number, ownerDocument: Document): Element;
  getTile(tileCoord: unknown, zoom: unknown, ownerDocument: unknown): Element | null {
      //this.getCOGTile().then()
      return document.createElement('DIV');
  }
  public releaseTile(tile: Element | null): void;
  public releaseTile(tile: Element): void;
  public releaseTile(tile: unknown): void {

  }

  async getCOGTile(tiff: any, url: string, z: number, x: number, y:number, isRGB: Boolean, samples: number[]) {

    const id = `${url}-${samples ? samples.join(',') : 'all'}-${z}-${x}-${y}`;

    if (!this.tileCache[id]) {
      const image = await tiff.getImage(await tiff.getImageCount() - z - 1);

      // const poolSize = image.fileDirectory.Compression === 5 ? 4 : null;
      // const poolSize = null;

      const wnd = [
        x * image.getTileWidth(),
        image.getHeight() - ((y + 1) * image.getTileHeight()),
        (x + 1) * image.getTileWidth(),
        image.getHeight() - (y * image.getTileHeight()),
      ];

      if (isRGB) {
        this.tileCache[id] = image.readRGB({
          window: wnd,
          pool: image.fileDirectory.Compression === 5 ? this.pool : null,
        });
      } else {
        this.tileCache[id] = image.readRasters({
          window: wnd,
          samples,
          pool: image.fileDirectory.Compression === 5 ? this.pool : null,
        });
      }
    }

    return this.tileCache[id];
  }

}

export class OverlayMapType implements google.maps.MapType {

  public name: string;
  public alt: string;
  public projection: google.maps.Projection;
  public radius: number;
  public opacity: number;
  public minZoom: number;
  public maxZoom: number
  public maxNativeZoom: number;
  public tileSize: google.maps.Size;


  private tiles: HTMLElement[] = [];
  private getTileUrl: (tileCoord: google.maps.Point, zoom: number) => string;
  public releaseTile = (tile: HTMLElement) => {
    this.tiles = this.tiles.filter((t) => t !== tile);
  };
  public setOpacity = (opacity: number) => {
    this.tiles.map(t => t.style.opacity = opacity.toString())
  };

  public getTile = (tileCoord: google.maps.Point, zoom: number, ownerDocument: Document): Element => {
    let src: string;
    const tile = document.createElement('div'),
      img = document.createElement('img');
    tile.style.overflow = 'hidden';
    tile.style.position = 'absolute';
    tile.style.width = this.tileSize.width.toString() + 'px';
    tile.style.height = this.tileSize.height.toString() + 'px';
    tile.style.opacity = this.opacity.toString();
    img.onerror = (event) => {img.src = 'assets/blank.png'};
    if (zoom > this.maxNativeZoom) {

      const ctx = this.getMaxNativeTileCtx(tileCoord, zoom, this.maxNativeZoom);
      tileCoord = ctx.coords;
      src = this.getTileUrl(tileCoord, this.maxNativeZoom);
      if (src) {
        img.src = src;
        img.style.width = ctx.offset.width;
        img.style.height = ctx.offset.height;
        img.style.position = 'relative';
        img.style.left = ctx.offset.left;
        img.style.top = ctx.offset.top;
      }

    } else {
      src = this.getTileUrl(tileCoord, zoom);
      if (src) {
        img.src = src;
      }
    }
    this.tiles.push(tile);
    tile.appendChild(img);
    return tile;
  };

  private getMaxNativeTileCtx(tileCoord: google.maps.Point, currentZoom: number, maxNativeZoom: number) {
    const tx = tileCoord.x, ty = tileCoord.y,
      wx = tx / Math.pow(2, currentZoom), wy = ty / Math.pow(2, currentZoom),
      wx1 = (tx + 1) / Math.pow(2, currentZoom), wy1 = (ty + 1) / Math.pow(2, currentZoom),
      mx = Math.floor(wx * Math.pow(2, maxNativeZoom)), my = Math.floor(wy * Math.pow(2, maxNativeZoom)),
      wmx = mx / Math.pow(2, maxNativeZoom), wmy = my / Math.pow(2, maxNativeZoom),
      wmx1 = (mx + 1) / Math.pow(2, maxNativeZoom), wmy1 = (my + 1) / Math.pow(2, maxNativeZoom),
      mp = Math.pow(2, (currentZoom - maxNativeZoom)),
      left = -256 * mp * (wx - wmx) / (wmx1 - wmx),
      top = -256 * mp * (wy - wmy) / (wmy1 - wmy),
      width = 256 * mp + 'px', height = 256 * mp + 'px';

    return {
      coords: new google.maps.Point(mx, my),
      offset: {
        left: left + 'px',
        top: top + 'px',
        width: width,
        height: height
      }
    }

  }


  constructor(private config: OverlayMapTypeOptions) {
    this.minZoom = config.minZoom || 0;
    this.maxNativeZoom = config.maxNativeZoom || 12;
    this.maxZoom = config.maxZoom || 12;
    this.getTileUrl = config.getTileUrl;
    this.opacity = config.opacity || 1;
    this.tileSize = config.tileSize || new google.maps.Size(256, 256);
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges {
  @ViewChild('map') mapRef: ElementRef;
  private ready: boolean;
  private map: google.maps.Map;
  private maptype: google.maps.MapTypeId;
  private data: google.maps.Data;
  private dataListeners: google.maps.MapsEventListener[] = [];
  private data_layers: google.maps.Data[] = [];
  private onDrawHandler: Function;
  private activeInfoWindow: google.maps.InfoWindow;

  @Input() context: {center: google.maps.LatLng | undefined, zoom: number | undefined, source: string}
  @Output() contextChange = new EventEmitter< {center: google.maps.LatLng | undefined, zoom: number | undefined, source: string}>();
  @Input() mapId: string;


  @Input() basemap: google.maps.MapTypeId;

  constructor(
    private mapState: MapStateService,
    private ref: ChangeDetectorRef) {
      setInterval(() => {
        this.ref.markForCheck();
      }, 1000);
    this.ready = false;
  }

  setDrawingMode(mode: google.maps.drawing.OverlayType | undefined) {
    if (this.map) {
      if (!mode) {
        this.data.setControls(null);
        this.data.setDrawingMode(null);
        this.data.setStyle({
          editable: false,
          draggable: false
        });
      } else {
        this.data.setControls([mode]);
        this.data.setDrawingMode(mode);
        this.data.setStyle({
          editable: true,
          draggable: true
        });
        this.data.setMap(this.map);
        this.setDataListeners();
      }
    }
  }


  public clearGeojson() {
    if (this.map && this.data) {
      const map = this.map;
      this.data.forEach(function (feature) {
        map.data.remove(feature);
      });
    }
  }

  /*
   * Clears data layer. All if no id given.
   */
  public clearDataLayer(id?: string) {
    if (!id ) {
      while (this.data_layers.length > 0) {
        const layer = this.data_layers.pop();
        if(layer) layer.setMap(null);
      }
    } else {
      this.data_layers = this.data_layers.filter(
        function (layer) {
          if (layer.get('id') === id) {
            layer.setMap(null);
            return false;
          } else {
            return true;
          }
        }
      );

    }
  }

  public setDataStyle(styler: google.maps.Data.StylingFunction) {
    this.data.setStyle(styler);
  }

  public styleDataLayer(styler: { id: string, style: google.maps.Data.StylingFunction }) {
    this.data_layers.forEach(
      function (layer) {
        if (layer.get('id') === styler.id) {
          layer.setStyle(styler.style);
        }
      }
    );
  }

  setDataListeners() {
    const self = this;
    this.dataListeners.forEach((l, i, a) => l.remove());
    this.dataListeners.push(google.maps.event.addListener(
      this.data, 'addfeature', function () {

        self.map.data.forEach(
          function (feature: any) {
            feature.setProperty('selected', false);
          }
        );
        (self.onDrawHandler || (() => { }))(self);
      }));
    this.dataListeners.push(google.maps.event.addListener(
      this.data, 'click', function (event: google.maps.Data.MouseEvent) {
        event.feature.toGeoJson(
          function (g) {
            self.map.data.forEach(
              function (feature: any) {
                feature.setProperty('selected', false);
              }
            );
            // TODO: seperate these events better
            event.feature.setProperty('selected', true);
          }
        );
      }));
  }

  removeDataListeners() {
    (this.dataListeners || []).forEach((l) => l.remove());
  }

  updateDataLayer(datalayer: google.maps.Data) {
    this.map.data.setMap(null);
    datalayer.setMap(this.map);
  }

  setOverlay(overlay: Overlay) {
    const self = this;
    let overlayMapType;

    if (this.ready && overlay.mapIds.indexOf(this.mapId) >= 0 ) {
      if(overlay.type.format == 'XYZ') {

        overlayMapType =  new DeckOverlay({

            layers: [
              new TileLayer({
              // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
                data: overlay.type.tileurl,

                //opacity: (overlay.opacity >= 0) ? overlay.opacity : 0.8,
                minZoom: overlay.minzoom,
                maxZoom: overlay.maxnativezoom,
                tileSize: 256,
                onClick: (info, event) => {
                  console.log(info, event)
                },
                renderSubLayers: (props) => {

                  const {
                    bbox: {west, south, east, north}
                  } = props.tile;

                  return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [west, south, east, north]
                  });
              }
            })]});
      } else  {
        overlayMapType = new DeckOverlay({
          layers: [
            new MVTLayer({
            data: overlay.type.tileurl,

            minZoom: 0,
            maxZoom: 23,
            getLineColor: [250, 100, 100, 100],
            getFillColor: [140, 170, 180, 0],
            getLineWidth: 3,
            lineWidthMinPixels: 3,
            pickable: true,
            onClick: (info, event) => console.log('Clicked:', info, event)
          })],
          getTooltip: ({object}) => object && {
            html: prettyPrintJson.toHtml(
              object.properties,
              {lineNumbers: true}),
              style: {
                'max-width': '300px',
                overflow: 'hidden',
                'z-index': 10

              }
          }
        });

      }

      overlayMapType.setMap(this.map)

    } else if (this.ready) {
      this.map.overlayMapTypes.clear();
    }
  }



  addControl(control: HTMLElement, position: google.maps.ControlPosition) {
    this.map.controls[position].push(control);
  }

  applyParams(params: any) {
    const lat = (params.ll || '').split(',')[0],
      lng = (params.ll || '').split(',')[1],
      zoom = params.z,
      center = new google.maps.LatLng(lat, lng);

    if(zoom) this.mapState.setZoom(zoom);
    if(center) this.map.setCenter(center);
  }
  ngAfterViewInit() {

    const self = this, mapProp = {
      center: this.context.center,
      zoom: this.context.zoom,
      streetViewControl: false,
      mapTypeId: this.basemap,
      styles: new SimpleBaseMap().style,
      scaleControl: true,
      tilt: 0,
      minZoom: 4,
      maxZoom: 20,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
      },
      controlSize: 24,
      mapId: '68b848d451bc688d'
    };

    this.map = new google.maps.Map(this.mapRef.nativeElement, mapProp);
    this.data = this.map.data;
    this.ready = true;


    const input = document.createElement('input');
    input.placeholder = 'Search for a location';
    input.style.margin = '5px';
    input.style.padding = '5px';
    input.style.border = '1pt solid gray';
    input.style.borderRadius = '2px';
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['(regions)'], componentRestrictions: {
        country: 'US'
      }
    });


    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    autocomplete.addListener('place_changed', function () {

        self.mapState.setBounds(autocomplete.getPlace().geometry?.viewport);

    });


    this.addListeners();


    // subscribe to mapstate changes
    this.mapState.overlays.subscribe(overlays => {
      if (this.activeInfoWindow) { this.activeInfoWindow.close() }
      this.map.overlayMapTypes.clear();
      overlays.forEach(o => this.setOverlay(o))
    });

    this.mapState.drawingMode.subscribe(m => this.setDrawingMode(m));
    this.mapState.draw.subscribe(h => this.onDrawHandler = h);
    this.mapState.geojson.subscribe(g => {
      if (this.activeInfoWindow) { this.activeInfoWindow.close() }
      if (g) {
        this.data.addGeoJson(g)
      } else { this.clearGeojson() }
    });
    this.mapState.dataLayerStyles.subscribe(s => this.styleDataLayer(s));
    this.mapState.infoWindow.subscribe(w => {
      if (this.activeInfoWindow) { this.activeInfoWindow.close() }
      this.activeInfoWindow = w;
      w.open(this.map);
    });



  }

  addListeners() {
    const self = this;
    google.maps.event.addListener(this.map, 'bounds_changed', function() {

      self.contextChange.emit({zoom: self.map.getZoom(),
                               center: self.map.getCenter(),
                               source: self.mapId});



    });

  }

  clearListeners() {
    google.maps.event.clearListeners(this.map, 'bounds_changed');
  }
  ngOnChanges(changes: SimpleChanges): void {
      if(this.map && this.ready && changes['context']
                  && changes['context'].currentValue.source !== this.mapId ) {
        this.ready=false;
        this.clearListeners();
        this.map.setZoom(changes['context'].currentValue.zoom);
        this.map.setCenter(changes['context'].currentValue.center);
        setTimeout(() => {this.ready=true;this.addListeners();},1);


      }
  }
}
