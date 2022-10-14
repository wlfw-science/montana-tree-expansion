import { Injectable } from '@angular/core';

@Injectable()
export class SimpleBaseMap {
  style: any;
  constructor() {
    this.style = [
    {
      'featureType': 'landscape',
      'elementType': 'geometry.fill',
      'stylers': [
        { 'color': '#fffefe' }
      ]
    }, {
      'featureType': 'poi.park',
      'stylers': [
        { 'visibility': 'off' }
      ]
    }, {
      'featureType': 'administrative',
      'elementType': 'geometry.fill',
      'stylers': [
        { 'visibility': 'off' }
      ]
    }, {
      'featureType': 'poi',
      'elementType': 'geometry.fill',
      'stylers': [
        { 'visibility': 'off' }
      ]
    }, {
      'featureType': 'water',
      'elementType': 'geometry.fill',
      'stylers': [
        { 'color': '#46bcec' }
      ]
    }, {
      'featureType': 'road.highway',
      'stylers': [
        { 'visibility': 'simplified' }
      ]
    }, {
      'featureType': 'road',
      'stylers': [
        { 'saturation': -25 }
      ]
    }
    ];
  }
}
