
import { Component, Input, OnChanges,  ChangeDetectorRef, AfterViewInit, ViewChild, EventEmitter, ElementRef, Output, SimpleChanges } from '@angular/core';
import { SimpleBaseMap } from './basemaps.service';
import { Overlay} from '../../services/overlays.service';
import { MapStateService } from '../../services/map-state.service';
import { GoogleMapsOverlay } from '@deck.gl/google-maps/typed';
import {MVTLayer} from '@deck.gl/geo-layers/typed';
import {BitmapLayer} from '@deck.gl/layers/typed';
import {TileLayer, TileLayerProps, _Tile2DHeader, GeoBoundingBox} from '@deck.gl/geo-layers/typed';
import {MapView} from '@deck.gl/core/typed'



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges {
  @ViewChild('map') mapRef: ElementRef;
  private ready: boolean;
  private map: google.maps.Map;
  private deckgl: GoogleMapsOverlay;
  private layers: (TileLayer | MVTLayer)[] = [];

  @Input() context: {center: google.maps.LatLng | undefined, zoom: number | undefined, source: string}
  @Output() contextChange = new EventEmitter< {center: google.maps.LatLng | undefined, zoom: number | undefined, source: string}>();
  @Input() mapId: string;
  @Input() basemap: google.maps.MapTypeId;
  @Output() mapClick = new EventEmitter<any>();


  constructor(
    private mapState: MapStateService,
    private ref: ChangeDetectorRef) {
      setInterval(() => {
        this.ref.markForCheck();
      }, 1000);
    this.ready = false;
  }


  setOverlay(overlay: Overlay) {
    const self = this;
    let layer;

    if (this.ready && overlay.mapIds.indexOf(this.mapId) >= 0 ) {
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
                    bounds: [west, south, east, north]
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
      let deckStyle = document.createElement('div').style;
      //deckStyle.setProperty("--mask", "linear-gradient(to right, rgba(0,0,0, 1) 0, rgba(0,0,0, 1) 50%, rgba(0,0,0, 0) 0 ) 100% 50% / 100% 100% repeat-x");
      //deckStyle.setProperty("-webkit-mask", "var(--mask)");
      //deckStyle.setProperty("mask", "var(--mask)");

      this.deckgl.setProps({
        layers: this.layers,
        style: deckStyle
      });

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

        this.map.setZoom(changes['context'].currentValue.zoom);
        this.map.setCenter(changes['context'].currentValue.center);
        setTimeout(() => {this.ready=true;this.addListeners();},1);


      }
  }
}
