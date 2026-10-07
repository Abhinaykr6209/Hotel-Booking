import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';
import HotelFormPage from './pages/HotelFormPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HotelList />} />
        <Route path="/hotels/new" element={<HotelFormPage />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/hotels/:id/edit" element={<HotelFormPage />} />
      </Route>
    </Routes>
  );
}
