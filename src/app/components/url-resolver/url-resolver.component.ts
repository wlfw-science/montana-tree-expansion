
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { UrlService } from '../../services/url.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-url-resolver',
  templateUrl: './url-resolver.component.html',
  styleUrls: ['./url-resolver.component.css']
})
export class UrlResolverComponent implements OnInit {
  urlResolver: UrlService;
  constructor(http: HttpClient, private router: Router, private route: ActivatedRoute) {
    this.urlResolver = new UrlService(http);
  }

  resolveShortUrl(params: any) {
    this.urlResolver.longUrl('https://goo.gl/' + params.shortUrl).pipe(
      catchError((e) => {
        this.router.navigate(['']);
        return observableThrowError('No short URL found! Using default route')}))
      .subscribe((u: any) => window.location.href = u['longUrl']);
  }

  ngOnInit() {
    this.route.params
      .subscribe(this.resolveShortUrl.bind(this));
  }

}
