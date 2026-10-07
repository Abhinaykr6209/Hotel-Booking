import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <h3>StayFinder</h3>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
        <div>
          <h5>Explore</h5>
          <Link to="/">All hotels</Link>
          <Link to="/hotels/new">Add a hotel</Link>
        </div>
        <div>
          <h5>Support</h5>
          <span>Help center</span>
          <span>Contact us</span>
        </div>
      </div>
    </footer>
  );
}
