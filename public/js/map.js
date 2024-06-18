mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 11,
});

const marker1 = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates) ///listing.geometry.coordinates
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setText(
      "Exact location provided after booking"
  )
    )
  
  .addTo(map);

//  [72.85147,19.220676]
