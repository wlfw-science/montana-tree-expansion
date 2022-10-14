import { Component} from '@angular/core';
import { RoutingService } from '../../services/routing.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
 /*
  * Container for the app, holds root router-outlet
  */
  constructor(
    private routing: RoutingService,
   ) {
   }




}
