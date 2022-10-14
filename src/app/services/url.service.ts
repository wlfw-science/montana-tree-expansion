import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable()
export class UrlService {
  apiUrl = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks';
  apiKey = 'AIzaSyA2IbdH4K2g-lhlBj9J5DLSRyO9EZ8HZQE';

  constructor(
    private http: HttpClient
  ) { }

  public shortUrl() {
    return this.http.post(
      this.apiUrl + '?key=' + this.apiKey,
      {
        'dynamicLinkInfo': {
          'dynamicLinkDomain': 'rangelands.page.link',
          'link': window.location.href
        }
      }
    );
  }

  public longUrl(shortUrl: string) {
    return this.http.get(this.apiUrl,
      {
        params: new HttpParams()
          .set('key', this.apiKey)
          .set('shortUrl', shortUrl)
      }
    )
  }

}
