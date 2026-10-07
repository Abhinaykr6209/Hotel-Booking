import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHotelsApi, deleteHotelApi } from '../api/hotelApi';

export const fetchHotels = createAsyncThunk('hotels/fetch', async (params) => {
  const { data } = await fetchHotelsApi(params);
  return data; // { total, data }
});

export const deleteHotel = createAsyncThunk('hotels/delete', async (id) => {
  await deleteHotelApi(id);
  return id;
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
    filters: { title: '', minPrice: '', maxPrice: '' },
    page: 1,
    limit: 6,
    deleteSuccess: false,
  },
  reducers: {
    setFilters(state, { payload }) {
      state.filters = payload;
      state.page = 1; // go back to page 1 on a new search
    },
    setPage(state, { payload }) {
      state.page = payload;
    },
    closeDeletePopup(state) {
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchHotels.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.items = payload.data;
        s.total = payload.total;
        // if the current page is now empty (last item deleted), go one page back
        const pages = Math.max(1, Math.ceil(payload.total / s.limit));
        if (s.page > pages) s.page = pages;
      })
      .addCase(fetchHotels.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(deleteHotel.fulfilled, (s, { payload }) => {
        s.items = s.items.filter((h) => h.id !== payload);
        s.deleteSuccess = true; // shows the popup
      });
  },
});

export const { setFilters, setPage, closeDeletePopup } = hotelSlice.actions;
export default hotelSlice.reducer;
