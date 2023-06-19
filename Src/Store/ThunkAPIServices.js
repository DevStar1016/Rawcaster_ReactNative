import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  deleteNuggetService,
  likeAndUnlikeNuggetService,
  listNuggetsService,
  saveAndUnsaveNuggetService,
} from '../Services/ApiService';
import {
  addDeletedNuggetId,
  likeUnlikeNugget,
  saveUnSaveNugget,
  setIsDeletingNugget,
  setLikedSavedNuggets,
} from './Slices/NuggetActionsSlice';
import Toast from '../Components/Toast';
import {getFilteredDuplicatesList} from '../Utilities/Methods';
import {addFollowingUser, setFollowingUsersList} from './Slices/HomeSlice';

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
      const tempSavedNuggetsIds = [...res.data.nuggets_list]
        .filter(item => item.saved)
        .map(item => item.nugget_id);
      dispatch(
        setLikedSavedNuggets({
          likedNuggets: [...tempLikedNuggets],
          savedNuggetsIds: [...tempSavedNuggetsIds],
        }),
      );

      const tempFollowingUsersList = getFilteredDuplicatesList(
        [...res.data.nuggets_list],
        'user_id',
      )
        .filter(item => item.following)
        .map(item => ({
          user_id: item.user_id,
          follow_count: item.follow_count,
        }));
      dispatch(setFollowingUsersList([...tempFollowingUsersList]));

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
    } catch (error) {
      console.log(error, 'LIKED_ERROR');
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
    } catch (error) {
      console.log(error, 'SAVED_ERROR');
    }
  },
);

export const deleteNugget = createAsyncThunk(
  'deleteNugget',
  async (data, {rejectWithValue, getState, dispatch, fulfillWithValue}) => {
    dispatch(setIsDeletingNugget(true));
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('nugget_id', data.nugget_id);
    console.log(formData, 'FORMDATAAA');
    try {
      const res = await deleteNuggetService(formData);
      if (res.data.status === 1) {
        Toast.success(res.data.msg);
        dispatch(addDeletedNuggetId(data.nugget_id));
      } else if (res.data.status === 0) {
        Toast.fail(res.data.msg);
        // return rejectWithValue({errorMsg: res.data.msg});
      }
    } catch (e) {
      Toast.fail(e.message);
      // return rejectWithValue({errorMsg: error.message});
    } finally {
      dispatch(setIsDeletingNugget(false));
    }
  },
);

export const becomeFan = createAsyncThunk(
  'becomeFan',
  async (data, {rejectWithValue, getState, dispatch}) => {
    dispatch(
      addFollowingUser({
        user_id: data.user_id,
        follow_count: data.follow_count + 1,
      }),
    );

    // const formData = new FormData();
    // formData.append('token', getState().auth.token);
    // formData.append('follow_userid', data.user_ref_id);
    // formData.append('type', 1);
    // try {
    //   const res = await followAndUnfollowService(formData);
    //   console.log(res.data, 'FOLLOW RESPONSE');
    // } catch (error) {
    //   console.log(error, 'FOLLOW');
    // }
  },
);
