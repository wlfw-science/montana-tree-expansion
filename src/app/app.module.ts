import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RoutingModule } from './routing/routing.module';

// Material Form Controls
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule} from '@angular/material/form-field';

// Material Navigation
import { MatMenuModule } from '@angular/material/menu';
// Material Layout
import { MatCardModule } from '@angular/material/card';

import { MatListModule } from '@angular/material/list';

import { MatTabsModule } from '@angular/material/tabs';

// Material Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
// Material Data tables



import { AngularSplitModule } from 'angular-split';


import 'hammerjs';

import { AppComponent } from './components/root/app.component';
import { MapComponent } from './components/map/map.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LandcoverControlComponent } from './components/landcover-control/landcover-control.component';

import {GoogleMapsModule} from '@angular/google-maps'
import { RoutingService } from './services/routing.service';

import { MapStateService } from './services/map-state.service';

import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { GoogleMapsLoaderService } from './services/google-maps-loader.service';
import { LayoutComponent } from './components/layout/layout.component';
import { UrlResolverComponent } from './components/url-resolver/url-resolver.component';
// import { ShortLinkComponent } from './components/short-link/short-link.component';
import { HighlightPipe } from './pipes/highlight.pipe';
// import { LandcoverReportService } from './services/landcover-report.service';
import { PopoverComponent } from './components/popover/popover.component';
// import { LandcoverReportOptionsComponent } from './components/landcover-report-options/landcover-report-options.component';
import { ControlPanelToggleComponent } from './components/control-panel-toggle/control-panel-toggle.component';
import { HelpComponent } from './components/help/help.component';
import { OpacityControlComponent } from './components/opacity-control/opacity-control.component';
import { OverlayToggleControlComponent } from './components/overlay-toggle-control/overlay-toggle-control.component';
import { OverlayLegendComponent } from './components/overlay-legend/overlay-legend.component';
import { LayerGroupComponent } from './components/layer-group/layer-group.component';
import { MapSplitterComponent } from './components/map-splitter/map-splitter.component';

export function googleApisLoaderFactory(
  googleMapsApi: GoogleMapsLoaderService) {
  return () => googleMapsApi.load();
}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    HeaderComponent,
    FooterComponent,
    MapComponent,
    ControlPanelComponent,
    DialogComponent,
    LayoutComponent,
    UrlResolverComponent,
    // ShortLinkComponent,
    HighlightPipe,
    PopoverComponent,

    LandcoverControlComponent,
    ControlPanelToggleComponent,
    HelpComponent,

    // YearSelectorComponent,
    OpacityControlComponent,
    OverlayToggleControlComponent,
    OverlayLegendComponent,
    LayerGroupComponent,
    MapSplitterComponent
  ],
  imports: [
    GoogleMapsModule,
    AngularSplitModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,

    MatMenuModule, MatDialogModule, MatSnackBarModule, MatCardModule,
    MatSelectModule, MatSlideToggleModule, MatListModule, MatInputModule,
    MatTooltipModule, MatButtonModule, MatProgressSpinnerModule,
    MatSliderModule, MatButtonToggleModule, MatCheckboxModule,
    MatAutocompleteModule, MatIconModule, MatTabsModule, MatProgressBarModule,
    MatFormFieldModule
  ],
  entryComponents: [AppComponent], // LandcoverReportOptionsComponent
  providers: [
    GoogleMapsLoaderService,
    {
      provide: APP_INITIALIZER,
      useFactory: googleApisLoaderFactory,
      deps: [GoogleMapsLoaderService],
      multi: true
    },
    MapStateService,   RoutingService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() { }
}
