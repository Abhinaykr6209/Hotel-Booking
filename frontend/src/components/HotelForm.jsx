import { useState, useEffect } from 'react';
import { API_URL } from '../api/hotelApi';

const emptyValues = { title: '', description: '', latitude: '', longitude: '', price: '', rating: '' };

// same form is used for add and edit
export default function HotelForm({ initialData, onSubmit, submitting, serverErrors = [] }) {
  const [values, setValues] = useState(emptyValues);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});

  // edit mode - fill the fields with the saved values
  useEffect(() => {
    if (initialData) {
      const { title, description, latitude, longitude, price, rating, image_path } = initialData;
      setValues({ title, description, latitude, longitude, price, rating });
      setPreview(`${API_URL}${image_path}`);
    }
  }, [initialData]);

  // clean up the preview url
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const validate = () => {
    const e = {};
    if (values.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (values.description.trim().length < 10) e.description = 'Description must be at least 10 characters';

    const lat = Number(values.latitude);
    const lng = Number(values.longitude);
    if (values.latitude === '' || isNaN(lat) || lat < -90 || lat > 90) e.latitude = 'Latitude must be between -90 and 90';
    if (values.longitude === '' || isNaN(lng) || lng < -180 || lng > 180) e.longitude = 'Longitude must be between -180 and 180';

    if (values.price === '' || Number(values.price) <= 0) e.price = 'Enter a price greater than 0';

    const rt = Number(values.rating);
    if (values.rating === '' || isNaN(rt) || rt < 0 || rt > 5) e.rating = 'Rating must be between 0 and 5';

    if (!initialData && !file) e.image = 'Please choose an image';
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) e.image = 'Only JPG, PNG or WEBP images are allowed';
    if (file && file.size > 2 * 1024 * 1024) e.image = 'Image must be under 2MB';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f)); // local preview only
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData(); // FormData because we are sending a file
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    onSubmit(fd);
  };

  const field = (name, label, props = {}) => {
    const { as, ...rest } = props;
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        {as === 'textarea' ? (
          <textarea id={name} name={name} rows="4" value={values[name]} onChange={handleChange} />
        ) : (
          <input id={name} name={name} value={values[name]} onChange={handleChange} {...rest} />
        )}
        {errors[name] && <small className="error">{errors[name]}</small>}
      </div>
    );
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="image">Image</label>
        <input id="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} />
        {preview && <img className="preview" src={preview} alt="Hotel preview" />}
        {errors.image && <small className="error">{errors.image}</small>}
      </div>

      {field('title', 'Title')}
      {field('description', 'Description', { as: 'textarea' })}

      <div className="row">
        {field('latitude', 'Latitude', { type: 'number', step: 'any' })}
        {field('longitude', 'Longitude', { type: 'number', step: 'any' })}
      </div>

      <div className="row">
        {field('price', 'Price', { type: 'number', min: '0', step: '0.01' })}
        {field('rating', 'Rating (0 to 5)', { type: 'number', min: '0', max: '5', step: '0.1' })}
      </div>

      {serverErrors.map((m, i) => <p key={i} className="error">{m}</p>)}

      <button className="btn primary" disabled={submitting}>
        {submitting ? 'Saving…' : initialData ? 'Update hotel' : 'Add hotel'}
      </button>
    </form>
  );
}
