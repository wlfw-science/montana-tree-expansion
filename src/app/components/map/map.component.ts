
import { Component, Input,  AfterViewInit, ViewChild,  ViewContainerRef,
  EventEmitter, ElementRef, Output } from '@angular/core';
import { SimpleBaseMap } from './basemaps.service';
import { Overlay} from '../../services/overlays.service';
import { MapStateService } from '../../services/map-state.service';
import { GoogleMapsOverlay } from '@deck.gl/google-maps/typed';
import {MVTLayer} from '@deck.gl/geo-layers/typed';
import {BitmapLayer} from '@deck.gl/layers/typed';
import {TileLayer,  _Tile2DHeader} from '@deck.gl/geo-layers/typed';
import GL from '@luma.gl/constants';
import { RoutingService, Router } from '..';
import { TreecoverExpansionControlComponent } from '../treecover-expansion-control/treecover-expansion-control.component';
import { query } from '@angular/animations';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';


class OverlayMapType implements google.maps.MapType {
  tileSize: google.maps.Size = new google.maps.Size(256, 256);
  alt: string|null = null;
  maxZoom: number = 17;
  minZoom: number = 0;
  name: string|null = null;
  projection: google.maps.Projection|null = null;
  radius: number = 6378137;
  overlay: Overlay;




  constructor(overlay: Overlay) {
    this.overlay = overlay;
    this.name = overlay.name;
  }

  getTileUrl(a: google.maps.Point, z: number) {
    return this.overlay.type.tileurl.replace('{x}', a.x.toString())
                                    .replace('{y}', a.y.toString())
                                    .replace('{z}', z.toString());
  }


  getTile(coord: google.maps.Point,
    zoom: number,
    ownerDocument: Document
  ): HTMLElement {
    const img = ownerDocument.createElement("img");
    img.src = this.getTileUrl(coord, zoom);
    img.className = this.overlay.id;
    img.style.opacity = this.overlay.opacity.toString();

    return img;
  }

  releaseTile(tile: Element): void {}
}


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
  private overlays: {[id: string]: GoogleMapsOverlay} = {};
  public split: number = 50;

  @Input() mapId: string;
  @Input() basemap: google.maps.MapTypeId;
  @Output() mapClick = new EventEmitter<any>();




  splitterClicked = false;
  splitterOffset: number;
  featureData: {[id: string]: {}} = {}
  marker: google.maps.Marker = new google.maps.Marker();

  constructor(
    private mapState: MapStateService,
    private routing: RoutingService,
    private router: Router,
    private hostRef: ElementRef,
    public viewContainerRef: ViewContainerRef) {
      this.ready = false;
  }


  setOverlay(overlay: Overlay) {

    let layer: any;

    if (this.ready) {
      if(overlay.type.format == 'XYZ') {
        /*
        let overlayMapType = new OverlayMapType(overlay);
        let selectedIndex: number | null = null;
        this.map.overlayMapTypes.forEach((mt, i) => {
          if(mt?.name === overlay.name) {
            selectedIndex = i;
          }
        });
        if(selectedIndex !== null) {
          this.map.overlayMapTypes.setAt( selectedIndex, overlayMapType);
        } else {
          this.map.overlayMapTypes.push(overlayMapType);
        }
        console.log(this.map.overlayMapTypes.getAt(0))
        */
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
            opacity: (overlay.opacity >= 0) ? overlay.opacity: 0.8,
            minZoom: 0,
            maxZoom: 23,
            getLineColor: [250, 100, 100, 100],
            getFillColor: [140, 170, 180, 0],
            getLineWidth: 0,
            lineWidthMinPixels: 0,
            pickable: true,
            onClick: (info, event) => {
              this.featureData[overlay.id] = info.object.properties
              if(info.coordinate) {
                this.marker.setPosition(new google.maps.LatLng(info.coordinate[1],
                                                               info.coordinate[0]));
                this.marker.setMap(this.map);
              }  else {
                this.marker.setMap(null);
              }

              this.mapClick.emit(this.featureData);
            }
            //onHover: (info, event) => console.log('Hovered:', info, event)
          });


      }



      if(!this.overlays[overlay.id]) {

        this.overlays[overlay.id] = new GoogleMapsOverlay({
          layers: [layer],
          id: overlay.id,
        });
        this.overlays[overlay.id].setMap(this.map);
      } else {
        if(overlay.visible) {
          this.overlays[overlay.id].setProps({
            layers: [layer],
            id: overlay.id
          });
        } else {
          this.overlays[overlay.id].finalize();
          delete(this.overlays[overlay.id]);
        }
      }

      setTimeout(() => this.updateOverlaySplit(), 50);
      setTimeout(() => this.updateOverlaySplit(), 100);

      setTimeout(() => this.updateOverlaySplit(), 500);
      setTimeout(() => this.updateOverlaySplit(), 1000);



    }

  }

  ngAfterViewInit() {

    const self = this, mapProp = {

      fullscreenControl: false,
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
        setTimeout(()=>this.updateOverlaySplit(), 1000);

      }


      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(fullscreenControl);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(treecoverExpansionControlElementRef);

    }


   this.splitterRef.nativeElement.onmousedown = (e: any) => {
      e.preventDefault();
      this.splitterClicked = true;
      this.splitterOffset = this.splitterRef.nativeElement.offsetLeft - e.clientX;
    }

    this.splitterRef.nativeElement.onmouseup =  (e:any) => {
      this.splitterClicked = false;
  };

  this.splitterRef.nativeElement.onmousemove = (e:any) => {
      e.preventDefault();
      if (this.splitterClicked) {
        this.updateOverlaySplit();
      }
  }

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


    autocomplete.addListener('place_changed', function () {
      let bounds = autocomplete.getPlace().geometry?.viewport;
      if(bounds) {
        self.mapState.bounds.next(bounds);
      }
    });



    // subscribe to overlay changes, TODO: make sensitive to individual overlay changes
    this.mapState.overlays.subscribe((overlays) => {
      overlays.forEach((o) => o.subscribe((overlay) => {
        this.setOverlay(overlay);
        this.updateOverlaySplit();
      }));
    });

    this.mapState.bounds.subscribe(bounds => {
      this.map.fitBounds(bounds);
      this.updateOverlaySplit();
    });

    this.addListeners();
    this.loadUrlParams();
    this.updateOverlaySplit();

  }

  addListeners() {

    google.maps.event.addListener(this.map,
                                  'bounds_changed', ()=> {
                                    setTimeout(()=>this.updateUrlParams(), 1000)}
                                    );
    google.maps.event.addListener(this.map, 'mousemove', (e: any) => {
      if(this.splitterClicked && this.splitterRef.nativeElement.onmousemove) {
        this.splitterRef.nativeElement.style.left = e.pixel.x + 'px';
        this.updateOverlaySplit();
      }
    })

    google.maps.event.addListener(this.map, 'mouseup', (e: any) => {
      this.splitterClicked = false;
      this.updateOverlaySplit();
    })


  }


  updateOverlaySplit() {
    this.mapState.overlays.getValue().forEach((overlaySubject) => {

    let overlay = overlaySubject.getValue();
    let canvas = document.getElementById(overlay.id);
      if(canvas?.style && overlay.side) {
        let left: string, offset: number = overlay.side === 'right' ?
          (this.splitterRef.nativeElement.offsetLeft + this.splitterRef.nativeElement.offsetWidth/2)  :
          (this.mapRef.nativeElement.offsetWidth - (this.splitterRef.nativeElement.offsetLeft + this.splitterRef.nativeElement.offsetWidth/2));

        if(offset < 0) {
          this.splitterRef.nativeElement.style.left = '0px';
          offset  = 0;
          this.splitterRef.nativeElement.style.left = '0px';
        } else if (offset > this.mapRef.nativeElement.offsetWidth) {
          offset = this.mapRef.nativeElement.offsetWidth;
          this.splitterRef.nativeElement.style.left = (this.mapRef.nativeElement.offsetWidth - this.splitterRef.nativeElement.offsetWidth) + 'px'
        }
        left = offset + 'px'
        let mask = `linear-gradient(to ${overlay.side}, rgba(0,0,0, 1) 0, rgba(0,0,0, 1) ${left}, rgba(0,0,0, 0) 0 ) 100% 50% / 100% 100% repeat-x`;
        canvas.style.webkitMask = canvas.style.mask = mask;
      }
    });
  }

  loadUrlParams() {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    let ll = queryParams['ll'];
    let lat = ll ? ll.split(',')[0]: 46.4;
    let lng = ll ? ll.split(',')[1]: -110;
    let z = parseInt(queryParams['z'] || '7');
    let s = parseInt(queryParams['s'] || '50');
    this.map.setCenter(new google.maps.LatLng(lat, lng));
    this.map.setZoom(z);
    this.splitterRef.nativeElement.style.left = this.mapRef.nativeElement.offsetWidth*s/100 -
                                                this.splitterRef.nativeElement.offsetWidth + 'px';

    this.updateOverlaySplit();
  }

  updateUrlParams() {
    const params: {[key:string]: string | number} = {};
    params['ll'] = [this.map.getCenter()?.lat().toFixed(4) || 46.4, this.map.getCenter()?.lng().toFixed(4)|| -111.4].join(',');
    params['z'] = this.map.getZoom()?.toString() || '9';
    params['s'] = this.split;
    this.routing.updateUrlParams(params);
    window.parent.postMessage(JSON.stringify(this.router.parseUrl(this.router.url).queryParams), '*');
  }

  clearListeners() {
    google.maps.event.clearListeners(this.map, 'bounds_changed');
  }
}
