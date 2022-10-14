

export class GeojsonService {
  private geojson;
  private data = new google.maps.Data();

  constructor(geojson: any) {
    this.geojson = geojson;
    this.data.addGeoJson(geojson);
  }

  public getBounds() {
    const bounds = new google.maps.LatLngBounds();
    this.data.forEach((f) => this.processFeature(f.getGeometry(), bounds.extend, bounds));
    return bounds;
  }

  public combineFeatureCollections(fc1: any, fc2: any) {
    if (fc1) {
      if (fc2) {
        fc1.features = fc1.features.concat(fc2.features);
        return fc1;
      } else {
        return fc1;
      }
    }
  }

  private  processFeature(geometry: any, callback: Function, thisArg: any) {
    const self = this;
  if (geometry instanceof google.maps.LatLng) {
    callback.call(thisArg, geometry);
  } else if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
  } else {
    geometry.getArray().forEach(function(g: any) {
      self.processFeature(g, callback, thisArg);
    });
  }
}

}
