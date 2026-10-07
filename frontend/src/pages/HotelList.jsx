import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, deleteHotel, setFilters, setPage, closeDeletePopup } from '../store/hotelSlice';
import PageBanner from '../components/PageBanner';
import FilterSidebar from '../components/FilterSidebar';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';
import SuccessPopup from '../components/SuccessPopup';

export default function HotelList() {
  const dispatch = useDispatch();
  const { items, total, loading, error, filters, page, limit, deleteSuccess } = useSelector((s) => s.hotels);
  const [toDelete, setToDelete] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'grid'

  const load = () => dispatch(fetchHotels({ ...filters, limit, offset: (page - 1) * limit }));

  // reload when filters or page change
  useEffect(() => { load(); }, [filters, page, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmDelete = async () => {
    await dispatch(deleteHotel(toDelete.id));
    setToDelete(null);
    load(); // reload so the page fills up again
  };

  return (
    <>
      <Helmet>
        <title>Hotels | StayFinder</title>
        <meta name="description" content="Browse, search and filter hotels by title and price." />
      </Helmet>

      <PageBanner title="Hotels" crumbs={[{ label: 'All hotels' }]} />

      <div className="wrap content">
        <FilterSidebar filters={filters} onApply={(f) => dispatch(setFilters(f))} />

        <main>
          <div className="toolbar">
            <strong>{total} items found</strong>
            <div className="view-toggle">
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view">☰</button>
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view">▦</button>
            </div>
          </div>

          {loading && <p>Loading…</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && !items.length && <p>No hotels found.</p>}

          <div className={`list ${view}`}>
            {items.map((h) => <HotelCard key={h.id} hotel={h} onDelete={setToDelete} />)}
          </div>

          <Pagination page={page} total={total} limit={limit} onChange={(p) => dispatch(setPage(p))} />
        </main>
      </div>

      {toDelete && (
        <div className="overlay">
          <div className="popup">
            <p>Delete “{toDelete.title}”?</p>
            <button className="btn danger" onClick={confirmDelete}>Yes, delete</button>
            <button className="btn" onClick={() => setToDelete(null)}>Cancel</button>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <SuccessPopup message="Hotel deleted successfully!" onClose={() => dispatch(closeDeletePopup())} />
      )}
    </>
  );
}
