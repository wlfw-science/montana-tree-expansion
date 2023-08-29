import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { RoutingModule } from './routing/routing.module';

// Material Form Controls

import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Material Buttons & Indicators
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppComponent } from './components/root/app.component';
import { MapComponent } from './components/map/map.component';
import { RoutingService } from './services/routing.service';
import { MapStateService } from './services/map-state.service';
import { GoogleMapsLoaderService } from './services/google-maps-loader.service';
import { LayoutComponent } from './components/layout/layout.component';
import { OpacityControlComponent } from './components/opacity-control/opacity-control.component';
import { OverlayToggleControlComponent } from './components/overlay-toggle-control/overlay-toggle-control.component';
import { TreecoverExpansionControlComponent } from './components/treecover-expansion-control/treecover-expansion-control.component';
import { LinkifyPipe } from './pipes/linkify.pipe';

export function googleApisLoaderFactory(
  googleMapsApi: GoogleMapsLoaderService) {
  return () => googleMapsApi.load();
}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    LayoutComponent,
    OpacityControlComponent,
    OverlayToggleControlComponent,
    TreecoverExpansionControlComponent,
    LinkifyPipe
  ],
  imports: [
    BrowserModule,
    RoutingModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSliderModule,
    MatIconModule,
    ],
  entryComponents: [AppComponent],
  providers: [
    GoogleMapsLoaderService,
    {
      provide: APP_INITIALIZER,
      useFactory: googleApisLoaderFactory,
      deps: [GoogleMapsLoaderService],
      multi: true
    },
    MapStateService, RoutingService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() { }
}

