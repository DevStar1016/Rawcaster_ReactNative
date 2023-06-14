import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  likeAndUnlikeNuggetService,
  listNuggetsService,
  saveAndUnsaveNuggetService,
} from '../Services/ApiService';
import {
  likeUnlikeNugget,
  saveUnSaveNugget,
  setLikedSavedNuggets,
} from './Slices/NuggetActionsSlice';

export const getListNuggets = createAsyncThunk(
  'getListNuggets',
  async (data, {rejectWithValue, dispatch}) => {
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
      const tempLikedNuggets = [...res.data.nuggets_list]
        .filter(item => item.liked)
        .map(item => ({
          id: item.nugget_id,
          total_likes: item.total_likes,
        }));
      console.log(JSON.stringify(res.data.nuggets_list[0]), 'NUGGET');
      const tempSavedNuggetsIds = [...res.data.nuggets_list]
        .filter(item => item.saved)
        .map(item => item.nugget_id);
      console.log(tempSavedNuggetsIds, 'SAVEDNUGGETSSSS');
      dispatch(
        setLikedSavedNuggets({
          likedNuggets: [...tempLikedNuggets],
          savedNuggetsIds: [...tempSavedNuggetsIds],
        }),
      );
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

export const likeAndUnlikeNugget = createAsyncThunk(
  'likeAndUnlikeNugget',
  async (data, {rejectWithValue, getState, dispatch}) => {
    const likedNuggetsList = [...getState()?.nugget_actions?.likedNuggets];
    dispatch(
      likeUnlikeNugget({
        nugget_id: data.nugget_id,
        total_likes: data.total_likes,
      }),
    );
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('nugget_id', data.nugget_id);
    formData.append(
      'like',
      likedNuggetsList.find(item => item.id === data.nugget_id) ? 2 : 1,
    );

    try {
      const res = await likeAndUnlikeNuggetService(formData, data?.signal);
      console.log(res.data, 'LIKED RESPONSE');
      // return {
      //   data: res.data,
      // };
    } catch (error) {
      console.log(error, 'LIKED_ERROR');
      // return rejectWithValue({categoryName: data?.categoryName});
    }
  },
);

export const saveAndUnsaveNugget = createAsyncThunk(
  'likeAndUnlikeNugget',
  async (data, {rejectWithValue, getState, dispatch}) => {
    const savedNuggetsIds = [...getState()?.nugget_actions?.savedNuggetsIds];
    dispatch(saveUnSaveNugget(data.nugget_id));
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('nugget_id', data.nugget_id);
    formData.append('save', savedNuggetsIds.includes(data.nugget_id) ? 2 : 1);
    console.log(formData, 'FORMDATAAA');
    try {
      const res = await saveAndUnsaveNuggetService(formData, data?.signal);
      console.log(res.data, 'SAVED RESPONSE');
      // return {
      //   data: res.data,
      // };
    } catch (error) {
      console.log(error, 'SAVED_ERROR');
      // return rejectWithValue({categoryName: data?.categoryName});
    }
  },
);
