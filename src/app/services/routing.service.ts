import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';

const VALID_PARAMS = ["ll", "sl", "z", "b", "t_o"]

@Injectable()
export class RoutingService  {
  /*
   * Service to update URL query parameters as application state changes.
   */
  private urlSubject = new  BehaviorSubject<string>(this.location.path());
  public url = this.urlSubject.asObservable();

  constructor(
    private router: Router,
    private location: Location
  ) {
  }

  public getParams() {
    return this.router.parseUrl(this.router.url).queryParams;
  }

  public updateUrlParams(params: any) {
    /*
     * Really Google? Needed to merge params with existing params on route.
     */

     const newUrl = this.router.createUrlTree([], {
        queryParams: this.cleanParams(
          Object.assign(
            this.router.parseUrl(
              this.router.url).queryParams, params))
    });
    const currentUrl = this.router.createUrlTree([], {
      queryParams: this.cleanParams(
          this.router.parseUrl(
            this.router.url).queryParams)
  });


    if (newUrl.toString() !== currentUrl.toString()) {
      this.router.navigateByUrl(newUrl, {replaceUrl: true, skipLocationChange: false});
      this.urlSubject.next(newUrl.toString());
    }

    let postMessage ='updateUrlParams:' + this.router.url;
    window.parent.postMessage(postMessage, '*');

  }

  private cleanParams(params: any) {
    /*
    * Strips out empty query params.
    */
    const newParams: {[key:string] : string | number} = {}
    Object.keys(params).filter(key => (params[key] || params[key] === 0) && VALID_PARAMS.includes(key)).forEach(
      key => newParams[key] = params[key]);
    return newParams;
  }

}
