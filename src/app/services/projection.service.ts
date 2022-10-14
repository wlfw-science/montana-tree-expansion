
export class MercatorProjection  {
  private pixelOrigin_: google.maps.Point;
  private pixelsPerLonDegree_: number;
  private pixelsPerLonRadian_: number;


  constructor(TILE_SIZE: number) {
    this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
        TILE_SIZE / 2);
    this.pixelsPerLonDegree_ = TILE_SIZE / 360;
    this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
  }

private bound(value, opt_min, opt_max) {
  if (opt_min != null) {value = Math.max(value, opt_min); }
  if (opt_max != null) {value = Math.min(value, opt_max); }
  return value;
}

private degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}

private radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
}


fromLatLngToPoint = function(latLng, opt_point?) {
  const me = this;
  const point = opt_point || new google.maps.Point(0, 0);
  const origin = me.pixelOrigin_;

  point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  const siny = this.bound(Math.sin(this.degreesToRadians(latLng.lat())), -0.9999,
      0.9999);
  point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
      -me.pixelsPerLonRadian_;
  return point;
};

fromPointToLatLng = function(point) {
  const me = this;
  const origin = me.pixelOrigin_;
  const lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
  const latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
  const lat = this.radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) -
      Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};


}
