export default function StarRating({ value }) {
  const v = Math.min(5, Math.max(0, Number(value) || 0));
  return (
    <span className="rating" aria-label={`Rating ${v.toFixed(1)} out of 5`}>
      <span className="star-box" aria-hidden="true">
        ★★★★★
        <span className="star-fill" style={{ width: `${(v / 5) * 100}%` }}>★★★★★</span>
      </span>
      <span className="rating-num">{v.toFixed(1)}</span>
    </span>
  );
}
