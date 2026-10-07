import { Link } from 'react-router-dom';
import { API_URL } from '../api/hotelApi';
import StarRating from './StarRating';

export default function HotelCard({ hotel, onDelete }) {
  const snippet =
    hotel.description.length > 130 ? hotel.description.slice(0, 130) + '…' : hotel.description;

  return (
    <article className="card">
      <Link to={`/hotels/${hotel.id}`} className="card-img">
        <img src={`${API_URL}${hotel.image_path}`} alt={`${hotel.title} hotel`} loading="lazy" />
      </Link>
      <div className="card-body">
        <Link to={`/hotels/${hotel.id}`}><h3>{hotel.title}</h3></Link>
        <StarRating value={hotel.rating} />
        <p className="desc">{snippet}</p>
      </div>
      <div className="card-side">
        <p className="price">₹{Number(hotel.price).toLocaleString()} <span className="per-night">per night</span></p>
        <Link to={`/hotels/${hotel.id}/edit`} className="btn primary sm">Edit</Link>
        <button className="btn outline-danger sm" onClick={() => onDelete(hotel)}>Delete</button>
      </div>
    </article>
  );
}
