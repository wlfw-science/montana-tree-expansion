
import { Component, Input,  AfterViewInit, ViewChild,  ComponentRef, ViewContainerRef,
  EventEmitter, ElementRef, Output } from '@angular/core';

import { Overlay} from '../../services/overlays.service';
import { MapStateService } from '../../services/map-state.service';
import { GoogleMapsOverlay } from '@deck.gl/google-maps/typed';
import {BitmapLayer,GeoJsonLayer} from '@deck.gl/layers/typed';
import {TileLayer, _Tile2DHeader} from '@deck.gl/geo-layers/typed';
import {MaskExtension} from '@deck.gl/extensions/typed';

import GL from '@luma.gl/constants';
import { RoutingService, Router } from '..';
import { TreecoverExpansionControlComponent } from '../treecover-expansion-control/treecover-expansion-control.component';
import { SplitterControlComponent} from '../splitter-control/splitter-control.component'
import { AutocompleteControlComponent } from '../autocomplete-control/autocomplete-control.component';
import { FullscreenControlComponent } from '../fullscreen-control/fullscreen-control.component';

const infowindowTemplate = (featureData: any) => {
  if(featureData &&  featureData['AcqstnD'])
  return `
    <div class="feature-data">
      <p>
        Acquisition date: ${featureData['AcqstnD']}
      </p>
      <p>
        <a target="_sourceImage" href="${featureData['usgs_url']}">Source image</a>
      </p>
      <p>
        <a target="_gisData" href="${featureData['tile_url']}">Download GIS data</a>
      <p>
    </div>`
 else return  `
 <div class="feature-data">
   <p>
      No image data found at this location.
   <p>
 </div>`;
};

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapRef: ElementRef;
  @ViewChild('splitter') splitterRef: ElementRef;

  private ready: boolean;
  private map: google.maps.Map;
  private deck: GoogleMapsOverlay;
  private layers: {[id: string]: TileLayer } = {};
  private masks: {[id: string]: TileLayer | GeoJsonLayer} = {};
  public splitLng: number | null | undefined;
  treecoverExpansionControlRef: ComponentRef<TreecoverExpansionControlComponent>;
  splitterControlRef: ComponentRef<SplitterControlComponent>;
  autocompleteControlRef: ComponentRef<AutocompleteControlComponent>;
  fullscreenControlRef: ComponentRef<FullscreenControlComponent>;

  @Input() mapId: string;
  @Input() basemap: google.maps.MapTypeId;
  @Output() mapClick = new EventEmitter<any>();

  featureData: {[id: string]: {}} = {}
  marker: google.maps.Marker = new google.maps.Marker();
  infowindow: google.maps.InfoWindow = new google.maps.InfoWindow();

  constructor(
    private mapState: MapStateService,
    private routing: RoutingService,
    private router: Router,
    private hostRef: ElementRef,
    public viewContainerRef: ViewContainerRef) {
      this.ready = false;
      this.treecoverExpansionControlRef = this.viewContainerRef.createComponent(TreecoverExpansionControlComponent);
      this.splitterControlRef = this.viewContainerRef.createComponent(SplitterControlComponent);
      this.autocompleteControlRef = this.viewContainerRef.createComponent(AutocompleteControlComponent);
      this.fullscreenControlRef =  this.viewContainerRef.createComponent(FullscreenControlComponent);
  }

clickDeck(info:any, event:any) {
      let lat = info.coordinate[1],
          lng = info.coordinate[0];

      this.infowindow.setPosition(new google.maps.LatLng(info.coordinate[1],
      info.coordinate[0]));
      this.infowindow.setZIndex(100);
      this.infowindow.setContent("Fetching image data...");
      this.infowindow.open(this.map);

      fetch(`https://us-central1-wlfw-website.cloudfunctions.net/historical-imagery?lat=${lat}&lng=${lng}`)
        .then(response => response.json().then(
          featureData => {

            if(info.coordinate && featureData) {
              let html = infowindowTemplate(featureData);
              this.infowindow.setPosition(
                new google.maps.LatLng(
                  info.coordinate[1],
                  info.coordinate[0]));
              this.infowindow.setContent(html);
              this.infowindow.setZIndex(100);
              this.infowindow.open(this.map);
              this.updateUrlParams()

            }  else {
              this.infowindow.close();
            }
          }));

  }

  setOverlay(overlay: Overlay) {

    let layer: any;

    if (this.ready) {
      if(overlay.type.format == 'XYZ') {
        layer =  new TileLayer({
                data: overlay.type.tileurl,
                id: overlay.id,
                opacity: (overlay.opacity >= 0) ? overlay.opacity : 0.8,
                maxZoom:overlay.maxNativeZoom,
                tileSize: 256,
                maskId: overlay.mask,
                extensions: [new MaskExtension()],

                renderSubLayers: (props) => {
                  const {
                    boundingBox: [[west, south], [east, north]]
                  } = props.tile;

                  return new BitmapLayer(props, {
                    data: undefined,
                    image: props.data,
                    bounds: [west, south, east, north],
                    textureParameters: {
                      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
                    }

                  });
              }
            });

      }

      this.layers[overlay.id] = layer;
      let props = {
        layers:  Object.values(this.masks).concat(Object.values(this.layers)),
        onClick: this.clickDeck.bind(this)
      }

      if(!this.deck) {
        this.deck = new GoogleMapsOverlay(props)
        this.deck.setMap(this.map);
      } else {

        this.deck.setProps(props);

      }
      this.updateMaskBounds()
    }

  }

  ngAfterViewInit() {

    const self = this, mapProp = {

      fullscreenControl: false,
      streetViewControl: false,
      mapTypeId: this.basemap,
      scaleControl: true,
      tilt: 0,
      minZoom: 5,
      maxZoom: 20,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
      },
      controlSize: 24,
      mapId: '68b848d451bc688d'
    };

    this.map = new google.maps.Map(this.mapRef.nativeElement, mapProp);


    this.ready = true;


    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(this.splitterControlRef.instance.element.nativeElement);
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.fullscreenControlRef.instance.element.nativeElement);
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.treecoverExpansionControlRef.instance.element.nativeElement);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.autocompleteControlRef.instance.element.nativeElement);





   /*this.splitterControl.onmousedown = (e: any) => {
      e.preventDefault();
      this.splitterClicked = true;
      this.splitterOffset = this.splitterControl.offsetLeft - e.clientX;
      this.updateMaskBounds();
    }

    this.splitterControl.onmouseup =  (e:any) => {
      this.splitterClicked = false;
      this.updateMaskBounds();
  };

  this.splitterControl.onmousemove = (e:any) => {
      e.preventDefault();
      if (this.splitterClicked) {
        this.updateMaskBounds();
      }
  }*/



    /* autocomplete.addListener('place_changed', function () {
      let bounds = autocomplete.getPlace().geometry?.viewport;
      if(bounds) {
        self.mapState.bounds.next(bounds);
        self.updateMaskBounds();
      }
    });*/



    // subscribe to overlay changes, TODO: make sensitive to individual overlay changes
    this.mapState.overlays.subscribe((overlays) => {
      overlays.forEach((o) => o.subscribe((overlay) => {
        this.setOverlay(overlay);
      }));
      this.updateMaskBounds();
    });

    this.mapState.bounds.subscribe(bounds => {
      this.map.fitBounds(bounds);
      this.updateMaskBounds();
    });

    this.addListeners();
    this.loadUrlParams();

  }

  point2LatLng(point: google.maps.Point) {
    let p = this.map.getProjection(), b = this.map.getBounds(), z = this.map.getZoom() ;
    if(p && b && z ) {
      let topRight = p.fromLatLngToPoint(b.getNorthEast());
      let bottomLeft = p.fromLatLngToPoint(b.getSouthWest());
      if(topRight && bottomLeft) {
      let scale = Math.pow(2, z);
      let worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
      return p.fromPointToLatLng(worldPoint); }
    }
    return null;

  }
  updateSplitLng() {
    this.splitLng = this.point2LatLng(
          new google.maps.Point(
            this.splitterControlRef.instance.element.nativeElement.offsetLeft+this.splitterControlRef.instance.element.nativeElement.offsetWidth/2,
            this.splitterControlRef.instance.element.nativeElement.offsetHeight/2))?.lng();
  }

  addListeners() {

    google.maps.event.addListener(this.map,
                                  'bounds_changed', ()=> {
                                    let proj = this.map.getProjection();
                                      this.updateSplitLng();
                                      this.updateMaskBounds();
                                      this.updateUrlParams()
                                    }
                                  );
    google.maps.event.addListener(this.map, 'mousemove', (e: google.maps.MapMouseEvent | any) => {
      let proj = this.map.getProjection();
      if(this.splitterControlRef.instance.clicked) {
        this.splitterControlRef.instance.element.nativeElement.style.left = e.pixel.x + 'px';
        this.updateSplitLng();
        this.updateMaskBounds();
      }
    })

    google.maps.event.addListener(this.map, 'mouseup', (e: any) => {
      this.splitterControlRef.instance.clicked = false;
      this.updateMaskBounds();
    });

    google.maps.event.addListener(this.map, 'zoom_changed', (e: any) => {
      this.updateMaskBounds();
    })
    google.maps.event.addListener(this.map, 'idle', (e: any) => {
      this.splitterControlRef.instance.clicked = false;
      this.updateMaskBounds();
    });




  }


  updateMaskBounds() {
    let left = {
      "type": "Feature", "properties": {}, "geometry": {
        "type": "Polygon", "coordinates": [
          [[this.splitLng, 89.999],
          [
            -130,
            52
          ],
          [
            -130,
            10
          ],
          [
            this.splitLng,
            10
          ],
          [
            this.splitLng,
            52
          ]
          ]
        ]
      }
    };
    let right = {
      "type": "Feature", "properties": {}, "geometry": {
        "type": "Polygon", "coordinates": [
          [
            [
              -50,
              52
            ],
            [
              this.splitLng,
              52
            ],
            [
              this.splitLng,
              10
            ],
            [
              -50,
              10
            ],
            [
              -50,
              52
            ]
          ]
        ]
      }
    };
    this.masks = {left: new GeoJsonLayer({
                          id: 'left',
                          data: [left],
                          operation: 'mask'
                        }),
                  right: new GeoJsonLayer({
                          id: 'right',
                          data: [right],
                          operation: 'mask'
                        })
                  };
    if(this.deck){
      let props = {
        layers:  Object.values(this.masks).concat(Object.values(this.layers)),
        onClick: this.clickDeck.bind(this)
      }
      this.deck.setProps(props);
    }
    this.updateUrlParams();
  }

  latLngToPixels(latLng: google.maps.LatLng) : number[] {

    var projection = this.map.getProjection();
    var bounds = this.map.getBounds();
    var zoom = this.map.getZoom()
    if(projection && bounds && zoom) {
      var topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
      var bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
      var scale = Math.pow(2, zoom);
      var worldPoint = projection.fromLatLngToPoint(latLng);
      if(worldPoint && bottomLeft && topRight) {
        return [Math.floor((worldPoint.x - bottomLeft.x) * scale), Math.floor((worldPoint.y - topRight.y) * scale)];
      } else { throw(Error('Cant project Lat Lng'))}
    } else { throw(Error('Cant project Lat Lng'))}
  }

  loadUrlParams() {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    let ll = queryParams['ll'];
    let lat = ll ? ll.split(',')[0]: 46.7202540513347202;
    let lng = ll ? ll.split(',')[1]: -111.1498380657958620;
    /*let mll = queryParams['mll'];
    let mlat = mll ? mll.split(',')[0]: null;
    let mlng = mll ? mll.split(',')[1]: null;
    if(mlat && mlng) {
      google.maps.event.trigger(this.map, 'click', {latLng: new google.maps.LatLng(mlat,mlng)});
    }*/
    let z = parseInt(queryParams['z'] || '7');
    let split = parseFloat(queryParams['sl'] || lng);


    setTimeout(() => {
        try {
          this.map.setCenter(new google.maps.LatLng(lat, lng));
          this.map.setZoom(z);
          this.splitLng = split;
          let sPix = this.latLngToPixels(new google.maps.LatLng(lat, this.splitLng)) || [this.mapRef.nativeElement.offsetWidth / 2 - this.splitterControlRef.instance.element.nativeElement.offsetWidth/2];
          let x = sPix[0];
          if(x && (x > 0 && x < this.mapRef.nativeElement.offsetWidth)) {
            this.splitterControlRef.instance.element.nativeElement.style.left = x + 'px';

          } else {
            this.splitterControlRef.instance.element.nativeElement.style.left = this.mapRef.nativeElement.offsetWidth/2-this.splitterControlRef.instance.element.nativeElement.offsetWidth/2 + 'px';
          }

        } catch(e) {}

      this.updateMaskBounds();
    },1000);
  }

  updateUrlParams() {
    const params: {[key:string]: string | number | undefined} = {};
    params['ll'] = [this.map.getCenter()?.lat().toFixed(16) || 40.4, this.map.getCenter()?.lng().toFixed(16)|| -111.4].join(',');
    params['z'] = this.map.getZoom()?.toString() || '7';
    params['sl'] = this.splitLng ? this.splitLng.toFixed(16) : this.map.getCenter()?.lng().toFixed(16);
    params['mll'] = [this.infowindow.getPosition()?.lat().toFixed(16),  this.infowindow.getPosition()?.lng().toFixed(16)].join(',')
    this.routing.updateUrlParams(params);
    window.parent.postMessage(JSON.stringify(this.router.parseUrl(this.router.url).queryParams), '*');
  }

  clearListeners() {
    google.maps.event.clearListeners(this.map, 'bounds_changed');
  }
}
