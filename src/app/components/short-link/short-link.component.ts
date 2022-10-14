// import { Component, OnInit, NgZone , ViewEncapsulation } from '@angular/core';
// import { UrlService } from 'app/services/url.service';
// import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
// import { Router, ActivatedRoute } from '@angular/router';
// import { RoutingService } from 'app/services/routing.service';
// import { HttpClient } from '@angular/common/http';
// import { ViewChild } from '@angular/core';
// import { expandWidth } from 'app/constants/animations';
// 
// 
// @Component({
//   selector: 'app-short-link',
//   templateUrl: './short-link.component.html',
//   styleUrls: ['./short-link.component.css'],
//   providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
//   animations: [expandWidth]
// })
// export class ShortLinkComponent implements OnInit {
// 
//   @ViewChild('shortUrlInput', {static: false}) shortUrlInput;
// 
//   private urlTranslator: UrlService
//   shortUrl: string;
//   show = true;
//   waiting = false;
// 
//   constructor(
//     http: HttpClient,
//     private router: Router,
//     private routing: RoutingService,
//     private route: ActivatedRoute,
//     private zone: NgZone,
//     private location: Location) {
//     this.urlTranslator = new UrlService(http);
//   }
// 
//   showShortUrl() {
//     this.show = true;
//     this.urlTranslator.shortUrl().subscribe(u =>
//       this.shortUrl = u['shortLink']
//     );
//   }
// 
//   clearShortUrl() {
//     this.shortUrl = undefined;
//     this.show = false;
// 
//   }
// 
//   copyShortUrl() {
//     this.shortUrlInput.nativeElement.focus();
//     this.shortUrlInput.nativeElement.select();
//     document.execCommand('copy');
//     this.clearShortUrl();
//   }
// 
//   ngOnInit() {
//   }
// 
// }
