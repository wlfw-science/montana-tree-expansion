import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapStateService } from '../services/map-state.service';
import { RoutingService } from '../services/routing.service';
import { LayoutComponent } from '../components/layout/layout.component';

const appRoutes: Routes = [
  {path: '', component: LayoutComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    MapStateService,
    RoutingService
  ]
})
export class RoutingModule {}
