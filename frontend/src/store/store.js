import { configureStore } from '@reduxjs/toolkit';
import hotelReducer from './hotelSlice';

export default configureStore({
  reducer: { hotels: hotelReducer },
});
