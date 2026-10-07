import { useState, useEffect } from 'react';

const SLIDER_MAX = 10000;

export default function FilterSidebar({ filters, onApply }) {
  const [min, setMin] = useState(filters.minPrice);
  const [max, setMax] = useState(filters.maxPrice);
  const [error, setError] = useState('');

  useEffect(() => {
    setMin(filters.minPrice);
    setMax(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const apply = () => {
    if (min !== '' && max !== '' && Number(min) > Number(max)) {
      setError('Min price cannot be greater than max price');
      return;
    }
    setError('');
    onApply({ ...filters, minPrice: min, maxPrice: max });
  };

  const reset = () => {
    setMin('');
    setMax('');
    setError('');
    onApply({ ...filters, minPrice: '', maxPrice: '' });
  };

  return (
    <aside className="sidebar">
      <div className="panel">
        <h4>Price</h4>
        <input
          type="range"
          min="0"
          max={SLIDER_MAX}
          step="500"
          value={max === '' ? SLIDER_MAX : max}
          onChange={(e) => setMax(e.target.value)}
          aria-label="Maximum price"
        />
        <div className="minmax">
          <div>
            <label htmlFor="min">Min</label>
            <input id="min" type="number" min="0" placeholder="₹0" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
          <div>
            <label htmlFor="max">Max</label>
            <input id="max" type="number" min="0" placeholder="₹10000" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
        </div>
        {error && <small className="error">{error}</small>}
        <button className="btn-outline" onClick={apply}>APPLY</button>
        <button className="link-btn" onClick={reset}>Reset price</button>
      </div>
    </aside>
  );
}
