
import { Component, Input, OnChanges,  ChangeDetectorRef, AfterViewInit, ViewChild, EventEmitter, ElementRef, Output, SimpleChanges } from '@angular/core';
import { SimpleBaseMap } from './basemaps.service';
import { Overlay} from '../../services/overlays.service';
import { MapStateService } from '../../services/map-state.service';
import { GoogleMapsOverlay } from '@deck.gl/google-maps/typed';
import {MVTLayer} from '@deck.gl/geo-layers/typed';
import {BitmapLayer} from '@deck.gl/layers/typed';
import {TileLayer,  _Tile2DHeader} from '@deck.gl/geo-layers/typed';
import GL from '@luma.gl/constants';
import { RoutingService, Router } from '..';
import { query } from '@angular/animations';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapRef: ElementRef;
  private ready: boolean;
  private map: google.maps.Map;
  private deckgl: GoogleMapsOverlay;
  private layers: (TileLayer | MVTLayer)[] = [];
  public split: number = 50;
  @Input() mapId: string;
  @Input() basemap: google.maps.MapTypeId;
  @Output() mapClick = new EventEmitter<any>();

  splitter = document.createElement('div');
  splitterClicked = false;
  splitterOffset: number;

  constructor(
    private mapState: MapStateService,
    private routing: RoutingService,
    private router: Router,
    private ref: ChangeDetectorRef) {
      this.ready = false;
  }


  setOverlay(overlay: Overlay) {
    const self = this;
    let layer;

    if (this.ready && overlay.mapIds.indexOf(this.mapId) >= 0 ) {
      this.layers = this.layers.filter(l => l.id != overlay.id);

      if(overlay.type.format == 'XYZ') {

        layer =  new TileLayer({
                data: overlay.type.tileurl,
                id: overlay.id,
                opacity: (overlay.opacity >= 0) ? overlay.opacity : 0.8,
                minZoom: overlay.minzoom,
                maxZoom: overlay.maxnativezoom,
                tileSize: 256,

                renderSubLayers: (props) => {

                  const {
                    bbox: {west, south, east, north}
                  } = props.tile;

                  return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [west, south, east, north],
                    textureParameters: {
                      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
                    }

                  });
              }
            });
      } else  {
        layer = new MVTLayer({
            data: overlay.type.tileurl,
            id: overlay.id,
            minZoom: 0,
            maxZoom: 23,
            getLineColor: [250, 100, 100, 100],
            getFillColor: [140, 170, 180, 0],
            getLineWidth: 0,
            lineWidthMinPixels: 0,
            pickable: true,
            onClick: (info, event) => {
              this.mapClick.emit(info.object.properties)
            }
            //onHover: (info, event) => console.log('Hovered:', info, event)
          })

      }
      this.layers.push(layer);


      this.deckgl.setProps({
        layers: this.layers
      });


    }
  }

  addControl(control: HTMLElement, position: google.maps.ControlPosition) {
    this.map.controls[position].push(control);
  }


  ngAfterViewInit() {

    const self = this, mapProp = {
      //center: this.c,
      //zoom: this.mapState.zoom,
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
      //mapId: '68b848d451bc688d'
    };

    this.map = new google.maps.Map(this.mapRef.nativeElement, mapProp);
    this.deckgl = new GoogleMapsOverlay({});
    this.deckgl.setMap(this.map);

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




    this.splitter.style.position = 'relative';
    this.splitter.style.height =  '100%';
    this.splitter.style.width =  '12px';
    this.splitter.style.left = '50%';
    this.splitter.style.backgroundColor= '#eee';
    this.splitter.style.backgroundRepeat= 'no-repeat';
    this.splitter.style.backgroundPosition= '50%';
    this.splitter.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==")';
    this.splitter.style.cursor= 'col-resize';

    this.splitter.onmousedown = (e) => {
      this.splitterClicked = true;
      this.splitterOffset = this.splitter.offsetLeft - e.clientX;
      let overlay = document.getElementById('deckgl-overlay');
      if(overlay?.style) {
        overlay.style.webkitMask = `linear-gradient(to right, rgba(0,0,0, 1) 0, rgba(0,0,0, 1) ${this.splitter.style.left}, rgba(0,0,0, 0) 0 ) 100% 50% / 100% 100% repeat-x`;
        overlay.style.mask = `linear-gradient(to right, rgba(0,0,0, 1) 0, rgba(0,0,0, 1) ${this.splitter.style.left}, rgba(0,0,0, 0) 0 ) 100% 50% / 100% 100% repeat-x`;
      }
    }

    this.splitter.onmouseup =  (e) => {
      this.splitterClicked = false;
  };

  this.splitter.onmousemove = (e) => {
      e.preventDefault();
      if (this.splitterClicked) {

          this.splitter.style.left = e.clientX + this.splitterOffset + 'px';
          let overlay = document.getElementById('deckgl-overlay');
      if(overlay?.style) {
        overlay.style.webkitMask = `linear-gradient(to right, rgba(0,0,0, 1) 0, rgba(0,0,0, 1) ${this.splitter.style.left}, rgba(0,0,0, 0) 0 ) 100% 50% / 100% 100% repeat-x`;
        overlay.style.mask = `linear-gradient(to right, rgba(0,0,0, 1) 0, rgba(0,0,0, 1) ${this.splitter.style.left}, rgba(0,0,0, 0) 0 ) 100% 50% / 100% 100% repeat-x`;
      }

      }
  }
  google.maps.event.addListener(this.map, 'mousemove', (e: any) => {
    if(this.splitterClicked && this.splitter.onmousemove) {
      this.splitter.style.left =e.pixel.x + 'px';

    }
  })

  google.maps.event.addListener(this.map, 'mousup', (e: any) => {
    this.splitterClicked = false;
  })


    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.splitter);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    autocomplete.addListener('place_changed', function () {

        self.mapState.setBounds(autocomplete.getPlace().geometry?.viewport);

    });


    this.addListeners();

    // subscribe to mapstate changes
    this.mapState.overlays.subscribe(overlays => {
      this.deckgl.setProps({layers: []});
      overlays.forEach(o => this.setOverlay(o))
    });

    this.mapState.bounds.subscribe(bounds => this.map.fitBounds(bounds));
    this.loadUrlParams()
  }

  addListeners() {
    const self = this;
    google.maps.event.addListener(this.map,
                                  'bounds_changed', ()=>this.updateUrlParams());

  }

  loadUrlParams() {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    let lat = parseFloat(queryParams['ll'].split(',')[0]);
    let lng = parseFloat(queryParams['ll'].split(',')[1]);
    let z = parseInt(queryParams['z']);
    let s = parseInt(queryParams['s']);
    this.map.setCenter(new google.maps.LatLng(lat || 42, lng || -110));
    this.map.setZoom(z || 10);
    this.split = s;
  }

  updateUrlParams() {
    const params: {[key:string]: string | number} = {};
    params['ll'] = [this.map.getCenter()?.lat().toFixed(4), this.map.getCenter()?.lng().toFixed(4)].join(',');
    params['z'] = this.map.getZoom()?.toString() || '7';
    params['s'] = this.split;
    this.routing.updateUrlParams(params);
  }

  clearListeners() {
    google.maps.event.clearListeners(this.map, 'bounds_changed');
  }
}
