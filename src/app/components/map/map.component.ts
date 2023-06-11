
import { Component, Input,  AfterViewInit, ViewChild,  ViewContainerRef,
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

  @Input() mapId: string;
  @Input() basemap: google.maps.MapTypeId;
  @Output() mapClick = new EventEmitter<any>();




  splitterClicked = false;
  splitterOffset: number;
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
  }

clickDeck(info:any, event:any) {
      let lat = info.coordinate[1],
          lng = info.coordinate[0];

      this.infowindow.setPosition(new google.maps.LatLng(info.coordinate[1],
      info.coordinate[0]));
      this.infowindow.setContent("Fetching image data...");
      this.infowindow.open(this.map);

      fetch(`https://historical-imagery-zgxwzchaia-uc.a.run.app/?lat=${lat}&lng=${lng}`)
        .then(response => response.json().then(
          featureData => {

            if(info.coordinate && featureData) {
              let html = infowindowTemplate(featureData);
              this.infowindow.setPosition(new google.maps.LatLng(info.coordinate[1],
                                                            info.coordinate[0]));
              this.infowindow.setContent(html);
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

    let treecoverExpansionControlElementRef = this.viewContainerRef.createComponent(TreecoverExpansionControlComponent).instance.element.nativeElement;


    let template = document.createElement('template');
    let fullscreenHtml = `<button draggable="false" aria-label="Toggle fullscreen view" title="Toggle fullscreen view" type="button" aria-pressed="false" class="gm-control-active gm-fullscreen-control" style="background: none rgb(255, 255, 255); border: 0px; margin: 6px; padding: 0px; text-transform: none; appearance: none; position: absolute; cursor: pointer; user-select: none; border-radius: 2px; height: 24px; width: 24px; box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; overflow: hidden; top: 0px; right: 0px;"><img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;"><img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;"><img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;"></button>`
    fullscreenHtml = fullscreenHtml.trim();
    template.innerHTML = fullscreenHtml;
    if(template.content.firstChild) {
      const fullscreenControl: HTMLButtonElement = template.content.firstChild as HTMLButtonElement;
      fullscreenControl.onclick = (e) => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          fullscreenControl.innerHTML = `<img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;"><img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;"><img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;">`;
        } else {
         document.getElementsByTagName('app-layout')[0].requestFullscreen();
         fullscreenControl.innerHTML = `<img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M4%204H0v2h6V0H4v4zm10%200V0h-2v6h6V4h-4zm-2%2014h2v-4h4v-2h-6v6zM0%2014h4v4h2v-6H0v2z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;"><img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M4%204H0v2h6V0H4v4zm10%200V0h-2v6h6V4h-4zm-2%2014h2v-4h4v-2h-6v6zM0%2014h4v4h2v-6H0v2z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;"><img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M4%204H0v2h6V0H4v4zm10%200V0h-2v6h6V4h-4zm-2%2014h2v-4h4v-2h-6v6zM0%2014h4v4h2v-6H0v2z%22/%3E%3C/svg%3E" alt="" style="height: 14px; width: 14px;">`

        }
        setTimeout(()=>this.updateMaskBounds(), 1000);

      }


      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(fullscreenControl);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(treecoverExpansionControlElementRef);

    }


   this.splitterRef.nativeElement.onmousedown = (e: any) => {
      e.preventDefault();
      this.splitterClicked = true;
      this.splitterOffset = this.splitterRef.nativeElement.offsetLeft - e.clientX;
      this.updateMaskBounds();
    }

    this.splitterRef.nativeElement.onmouseup =  (e:any) => {
      this.splitterClicked = false;
      this.updateMaskBounds();
  };

  this.splitterRef.nativeElement.onmousemove = (e:any) => {
      e.preventDefault();
      if (this.splitterClicked) {
        this.updateMaskBounds();
      }
  }


    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


    autocomplete.addListener('place_changed', function () {
      let bounds = autocomplete.getPlace().geometry?.viewport;
      if(bounds) {
        self.mapState.bounds.next(bounds);
        self.updateMaskBounds();
      }
    });



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
            this.splitterRef.nativeElement.offsetLeft+this.splitterRef.nativeElement.offsetWidth/2,
            this.splitterRef.nativeElement.offsetHeigt/2))?.lng();
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
      if(this.splitterClicked) {
        this.splitterRef.nativeElement.style.left = e.pixel.x + 'px';
        this.updateSplitLng();
        this.updateMaskBounds();
      }
    })

    google.maps.event.addListener(this.map, 'mouseup', (e: any) => {
      this.splitterClicked = false;
      this.updateMaskBounds();
    });

    google.maps.event.addListener(this.map, 'zoom_changed', (e: any) => {
      this.updateMaskBounds();
    })
    google.maps.event.addListener(this.map, 'idle', (e: any) => {
      this.splitterClicked = false;
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
    let lat = ll ? ll.split(',')[0]: 46.4;
    let lng = ll ? ll.split(',')[1]: -110;
    let mll = queryParams['mll'];
    let mlat = mll ? mll.split(',')[0]: null;
    let mlng = mll ? mll.split(',')[1]: null;
    if(mlat && mlng) {
      google.maps.event.trigger(this.map, 'click', {latLng: new google.maps.LatLng(mlat,mlng)});
    }
    let z = parseInt(queryParams['z'] || '7');
    let split = parseFloat(queryParams['s'] || lng);


    setTimeout(() => {
        try {
          this.map.setCenter(new google.maps.LatLng(lat, lng));
          this.map.setZoom(z);
          this.splitLng = split;
          let sPix = this.latLngToPixels(new google.maps.LatLng(lat, this.splitLng)) || [this.mapRef.nativeElement.offsetWidth / 2 - this.splitterRef.nativeElement.offsetWidth/2];
          let x = sPix[0];
          if(x && (x > 0 && x < this.mapRef.nativeElement.offsetWidth)) {
            this.splitterRef.nativeElement.style.left = x + 'px';

          } else {
            this.splitterRef.nativeElement.style.left = this.mapRef.nativeElement.offsetWidth/2-this.splitterRef.nativeElement.offsetWidth/2 + 'px';
          }

        } catch(e) {}

      this.updateMaskBounds();
    },1000);
  }

  updateUrlParams() {
    const params: {[key:string]: string | number | undefined} = {};
    params['ll'] = [this.map.getCenter()?.lat().toFixed(16) || 46.4, this.map.getCenter()?.lng().toFixed(16)|| -111.4].join(',');
    params['z'] = this.map.getZoom()?.toString() || '14';
    params['s'] = this.splitLng ? this.splitLng.toFixed(16) : this.map.getCenter()?.lng().toFixed(16);
    params['mll'] = [this.infowindow.getPosition()?.lat().toFixed(16),  this.infowindow.getPosition()?.lng().toFixed(16)].join(',')
    this.routing.updateUrlParams(params);
    window.parent.postMessage(JSON.stringify(this.router.parseUrl(this.router.url).queryParams), '*');
  }

  clearListeners() {
    google.maps.event.clearListeners(this.map, 'bounds_changed');
  }
}
