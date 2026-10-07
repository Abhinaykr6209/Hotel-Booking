import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api/hotels` });

export const fetchHotelsApi = (params) => api.get('/', { params });
export const fetchHotelApi = (id) => api.get(`/${id}`);
export const createHotelApi = (formData) => api.post('/', formData); 
export const updateHotelApi = (id, formData) => api.put(`/${id}`, formData);
export const deleteHotelApi = (id) => api.delete(`/${id}`);
