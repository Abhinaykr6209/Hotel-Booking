import { Link } from 'react-router-dom';

export default function PageBanner({ title, crumbs = [] }) {
  return (
    <section className="banner">
      <div className="wrap">
        <h1>{title}</h1>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c, i) => (
            <span key={i}> &gt; {c.to ? <Link to={c.to}>{c.label}</Link> : <strong>{c.label}</strong>}</span>
          ))}
        </nav>
      </div>
    </section>
  );
}
