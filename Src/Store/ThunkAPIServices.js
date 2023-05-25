import {createAsyncThunk} from '@reduxjs/toolkit';
import {listNuggetsService} from '../Services/ApiService';

export const getListNuggets = createAsyncThunk(
  'getListNuggets',
  async (data, {dispatch, getState, fulfillWithValue, rejectWithValue}) => {
    // dispatch(getListNuggets.pending({categoryName: data?.categoryName}));
    const formData = new FormData();
    formData.append('token', data?.token ?? 'RAWCAST');
    formData.append('page_number', data?.pageNumber);
    formData.append('nugget_type', data?.nuggetType);
    formData.append('filter_type', data?.filterType ?? 0);
    if (data?.categoryType) {
      formData.append('category', data?.categoryType);
    }

    try {
      const res = await listNuggetsService(formData, data?.signal);
      return {
        data: res.data,
        pageNumber: data?.pageNumber,
        categoryName: data?.categoryName,
      };
    } catch (error) {
      return rejectWithValue({categoryName: data?.categoryName});
    }
  },
);
