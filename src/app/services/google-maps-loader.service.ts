import { Injectable } from '@angular/core';

const googleMapsApiUrl =
    'https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyA2IbdH4K2g-lhlBj9J5DLSRyO9EZ8HZQE&libraries=drawing,places';

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
