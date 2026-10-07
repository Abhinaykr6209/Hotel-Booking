import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageBanner from '../components/PageBanner';
import HotelForm from '../components/HotelForm';
import { fetchHotelApi, createHotelApi, updateHotelApi } from '../api/hotelApi';

// Used for both  /hotels/new  (add)  and  /hotels/:id/edit  (edit)
export default function HotelFormPage() {
  const { id } = useParams(); // undefined -> add mode
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);

  useEffect(() => {
    if (id) {
      fetchHotelApi(id)
        .then((r) => setHotel(r.data))
        .catch(() => setServerErrors(['Could not load this hotel']));
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setServerErrors([]);
    try {
      if (id) await updateHotelApi(id, formData);
      else await createHotelApi(formData);
      navigate('/');
    } catch (err) {
      setServerErrors(err.response?.data?.errors || ['Something went wrong']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{id ? 'Edit hotel' : 'Add hotel'} | StayFinder</title>
      </Helmet>
      <PageBanner
        title={id ? 'Edit hotel' : 'Add hotel'}
        crumbs={[{ label: 'Hotels', to: '/' }, { label: id ? 'Edit' : 'Add' }]}
      />
      <div className="wrap narrow">
        <HotelForm initialData={hotel} onSubmit={handleSubmit} submitting={submitting} serverErrors={serverErrors} />
      </div>
    </>
  );
}
