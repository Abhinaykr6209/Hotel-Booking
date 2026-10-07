export default function SuccessPopup({ message, onClose }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="popup">
        <div className="tick">✓</div>
        <p>{message}</p>
        <button className="btn primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
