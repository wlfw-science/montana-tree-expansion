import { Injectable } from '@angular/core';

const MAPS_KEY = 'AIzaSyAAB42DRQ--VMTYn1eJxiXiJ9u3eP3XIOg';
const googleMapsApiUrl =
    `https://maps.googleapis.com/maps/api/js?v=3&key=${MAPS_KEY}&libraries=places&callback=loadMap`;

@Injectable()
export class GoogleMapsLoaderService {
    promise: Promise<boolean>;
    load() {
        if (!this.promise) {
            this.promise = new Promise( resolve => {
                const node = document.createElement('script');
                node.src = googleMapsApiUrl;
                node.type = 'text/javascript';
                node.onload =  (ev) => resolve(true);
                console.log('Maps loaded');
                document.getElementsByTagName('head')[0].appendChild(node);
            });
        }
        return this.promise;
    }
}
