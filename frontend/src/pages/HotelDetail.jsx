import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import PageBanner from '../components/PageBanner';
import StarRating from '../components/StarRating';
import { fetchHotelApi, API_URL } from '../api/hotelApi';

// Vite breaks Leaflet's default marker image paths, so set them manually
L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    setHotel(null);
    setNotFound(false);
    fetchHotelApi(id)
      .then((r) => setHotel(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  // Browser Geolocation API: optionally also show the visitor's own position on the map
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => {} // permission denied or unavailable: just ignore
    );
  }, []);

  if (notFound) return <div className="wrap narrow"><p>Hotel not found.</p></div>;
  if (!hotel) return <div className="wrap narrow"><p>Loading…</p></div>;

  const pos = [Number(hotel.latitude), Number(hotel.longitude)];
  const imgUrl = `${API_URL}${hotel.image_path}`;

  return (
    <>
      <Helmet>
        <title>{hotel.title} | StayFinder</title>
        <meta name="description" content={hotel.description.slice(0, 150)} />
        <meta property="og:title" content={hotel.title} />
        <meta property="og:description" content={hotel.description.slice(0, 150)} />
        <meta property="og:image" content={imgUrl} />
      </Helmet>

      <PageBanner title={hotel.title} crumbs={[{ label: 'Hotels', to: '/' }, { label: hotel.title }]} />

      <div className="wrap detail">
        <img className="detail-img" src={imgUrl} alt={`${hotel.title} hotel`} />
        <h2>{hotel.title}</h2>
        <StarRating value={hotel.rating} />
        <p className="price">₹{Number(hotel.price).toLocaleString()} <span className="per-night">per night </span></p>
        <p className="desc-full">{hotel.description}</p>
        <p className="coords">Location: {hotel.latitude}, {hotel.longitude}</p>

        <MapContainer center={pos} zoom={13} className="map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={pos}><Popup>{hotel.title}</Popup></Marker>
          {userPos && <Marker position={userPos}><Popup>You are here</Popup></Marker>}
        </MapContainer>
      </div>
    </>
  );
}
