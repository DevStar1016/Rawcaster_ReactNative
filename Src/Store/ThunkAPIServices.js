import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

export const listNuggets = createAsyncThunk(
  'listNuggets',
  async (data, {dispatch}) => {
    dispatch(listNuggets.pending({category: data?.categoryName}));
    const formData = new FormData();
    formData.append('token', data?.token ?? 'RAWCAST');
    formData.append('page_number', data?.pageNumber);
    formData.append('nugget_type', data?.nuggetType);
    formData.append('filter_type', data?.filterType ?? 0);
    if (data?.categoryType) {
      formData.append('category', categoryType);
    }

    try {
      let response = await axios.get(
        'https://jsonplaceholder.typicode.com/posts',
      );
      return response.data;
    } catch (err) {
      throw new Error(err);
    }
  },
);
