import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../store/hotelSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filters = useSelector((s) => s.hotels.filters);
  const [q, setQ] = useState(filters.title);

  useEffect(() => setQ(filters.title), [filters.title]); // keep the box in sync with the store

  const submit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, title: q }));
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="wrap nav-inner">
        <Link to="/" className="logo">Stay<span>Finder</span></Link> 
        <form className="nav-search" onSubmit={submit} role="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Hotels By Hotel Title"
            aria-label="Search by title"
          />
          <button type="submit">Search</button>
        </form>
        <Link to="/hotels/new" className="btn">+ Add hotel</Link>
      </div>
    </header>
  );
}
