import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  addNuggetsService,
  blockMultipleUserService,
  blockUnblockUserService,
  deleteNuggetService,
  followAndUnfollowService,
  getInfluencerCategoryService,
  likeAndUnlikeNuggetService,
  listAllFriendGroupsService,
  listAllFriendsService,
  listNuggetsService,
  saveAndUnsaveNuggetService,
} from '../Services/ApiService';
import {
  addDeletedNuggetId,
  addUpdateUploadingNugget,
  likeUnlikeNugget,
  removeUploadingNugget,
  saveUnSaveNugget,
  setLikedSavedNuggets,
} from './Slices/NuggetActionsSlice';
import Toast from '../Components/Toast';
import {
  getAuthCode,
  getFilteredDuplicatesList,
  getUniqueId,
} from '../Utilities/Methods';
import {
  addFollowingUser,
  blockUsers,
  setConnectionsList,
  setConnectionsListLoading,
  setFollowingUsersList,
  setGroupListLoading,
  setGroupsList,
  setInfluencerCategoryList,
  unBlockUser,
} from './Slices/HomeSlice';
import {setGlobalLoaderData} from './Slices/UtilitySlice';
import {initiateAllNuggetsLoadingTotalPages} from './Slices/NuggetsListSlice';

/**
 * Asynchronously retrieves a list of nuggets based on the provided data.
 * @param {object} data - The data object containing the necessary parameters for the request.
 * @param {function} rejectWithValue - The function to call if the request is rejected.
 * @param {function} dispatch - The function to dispatch actions.
 * @returns A promise that resolves to an object containing the retrieved data, page number, and category name.
 * @throws If the request fails or is canceled.
 */
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
      if (res.data.status === 1) {
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
      }
      return {
        data: res.data,
        pageNumber: data?.pageNumber,
        categoryName: data?.categoryName,
      };
    } catch (error) {
      if (!error.message.includes('canceled')) {
        return rejectWithValue({
          categoryName: data?.categoryName,
          msg: error.message,
        });
      }
      return rejectWithValue({categoryName: null, msg: ''});
    }
  },
);

/**
 * An asynchronous thunk action creator that handles liking and unliking a nugget.
 * @param {Object} data - The data object containing the nugget ID and total likes.
 * @param {Function} rejectWithValue - The function to reject the thunk with a value.
 * @param {Function} getState - The function to get the current state of the store.
 * @param {Function} dispatch - The function to dispatch actions to the store.
 * @returns None
 */
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
    } catch (error) {}
  },
);

/**
 * Async thunk function that saves or unsaves a nugget.
 * @param {Object} data - The data object containing the nugget ID.
 * @param {Function} rejectWithValue - The function to reject the thunk with a value.
 * @param {Function} getState - The function to get the current state of the store.
 * @param {Function} dispatch - The function to dispatch actions to the store.
 * @returns None
 */
export const saveAndUnsaveNugget = createAsyncThunk(
  'likeAndUnlikeNugget',
  async (data, {rejectWithValue, getState, dispatch}) => {
    const savedNuggetsIds = [...getState()?.nugget_actions?.savedNuggetsIds];
    dispatch(saveUnSaveNugget(data.nugget_id));
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('nugget_id', data.nugget_id);
    formData.append('save', savedNuggetsIds.includes(data.nugget_id) ? 2 : 1);
    try {
      const res = await saveAndUnsaveNuggetService(formData, data?.signal);
    } catch (error) {}
  },
);

/**
 * Deletes a nugget asynchronously.
 * @param {object} data - The data object containing the nugget ID.
 * @param {function} rejectWithValue - The function to reject the async thunk with a value.
 * @param {function} getState - The function to get the current state of the application.
 * @param {function} dispatch - The function to dispatch actions to the store.
 * @param {function} fulfillWithValue - The function to fulfill the async thunk with a value.
 * @returns None
 */
export const deleteNugget = createAsyncThunk(
  'deleteNugget',
  async (data, {rejectWithValue, getState, dispatch, fulfillWithValue}) => {
    dispatch(
      setGlobalLoaderData({
        status: true,
        text: 'Deleting Nugget...',
      }),
    );

    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('nugget_id', data.nugget_id);
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
      dispatch(
        setGlobalLoaderData({
          status: false,
          text: '',
        }),
      );
    }
  },
);

/**
 * Asynchronous thunk action creator that allows a user to become a fan of another user.
 * @param {object} data - The data object containing the necessary information for becoming a fan.
 * @param {function} rejectWithValue - The function to reject the promise with a specific value.
 * @param {function} getState - The function to get the current state of the Redux store.
 * @param {function} dispatch - The function to dispatch actions to the Redux store.
 * @returns None
 */
export const becomeFan = createAsyncThunk(
  'becomeFan',
  async (data, {rejectWithValue, getState, dispatch}) => {
    dispatch(
      addFollowingUser({
        user_id: data.user_id,
        follow_count: data.follow_count + 1,
      }),
    );
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('follow_userid', data.user_ref_id);
    formData.append('type', 1);
    try {
      const res = await followAndUnfollowService(formData);
      if (res.data.status === 1) {
        dispatch(getInfluencersCategoriesList());
        if (data?.isEnableToast) {
          Toast.success(res.data.msg);
        }
      } else if (res.data.status === 0) {
        if (data?.isEnableToast) {
          Toast.fail(res.data.msg);
        }
      }
    } catch (error) {
      if (data?.isEnableToast) {
        Toast.fail(error.message);
      }
    }
  },
);

/**
 * Async thunk function that blocks or unblocks a user.
 * @param {object} data - The data object containing the necessary parameters.
 * @param {function} rejectWithValue - The function to reject the promise with a value.
 * @param {function} getState - The function to get the current state of the store.
 * @param {function} dispatch - The function to dispatch actions to the store.
 * @returns None
 */
export const blockUnblockUser = createAsyncThunk(
  'blockUnblockUser',
  async (data, {rejectWithValue, getState, dispatch}) => {
    dispatch(
      setGlobalLoaderData({
        status: true,
        text: `${data.action === 1 ? '' : 'Un'}Blocking User`,
      }),
    );
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('user_id', data.user_id);
    formData.append('action', data.action); // 1 - block, 2 - unblock
    try {
      const res = await blockUnblockUserService(formData);
      if (res.data.status === 1) {
        Toast.success(res.data.msg);
        if (data.action === 1) {
          dispatch(getInfluencersCategoriesList());
          dispatch(blockUsers([data.user_id]));

          let tempConnectionsList = [...getState().home.connectionsList];
          tempConnectionsList = [...tempConnectionsList].filter(
            item => item.user_id !== data.user_id,
          );
          dispatch(setConnectionsList(tempConnectionsList));
        } else {
          dispatch(unBlockUser(data.user_id));
        }
      } else if (res.data.status === 0) {
        Toast.fail(res.data.msg);
      }
    } catch (error) {
      Toast.fail(error.message);
    } finally {
      dispatch(
        setGlobalLoaderData({
          status: false,
          text: '',
        }),
      );
    }
  },
);

/**
 * Async thunk action creator that blocks multiple users.
 * @param {object} data - The data needed to block multiple users.
 * @param {function} rejectWithValue - The function to reject the async thunk with a value.
 * @param {function} getState - The function to get the current state of the store.
 * @param {function} dispatch - The function to dispatch actions to the store.
 * @returns None
 */
export const blockMultipleUsers = createAsyncThunk(
  'blockMultipleUsers',
  async (data, {rejectWithValue, getState, dispatch}) => {
    dispatch(
      setGlobalLoaderData({
        status: true,
        text: `Blocking Users`,
      }),
    );
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('user_id', JSON.stringify(data.user_id));
    try {
      const res = await blockMultipleUserService(formData);
      if (res.data.status === 1) {
        Toast.success(res.data.msg);
        dispatch(getInfluencersCategoriesList());
        dispatch(blockUsers([...data.user_id]));
        let tempConnectionsList = [...getState().home.connectionsList];
        tempConnectionsList = [...tempConnectionsList].filter(
          item => !data.user_id.includes(item.user_id),
        );
        dispatch(setConnectionsList(tempConnectionsList));
      } else if (res.data.status === 0) {
        Toast.fail(res.data.msg);
      }
    } catch (error) {
      Toast.fail(error.message);
    } finally {
      dispatch(
        setGlobalLoaderData({
          status: false,
          text: '',
        }),
      );
    }
  },
);

/**
 * Asynchronously adds a nugget by dispatching actions and making an API call.
 * @param {any} data - The data needed to add the nugget.
 * @param {object} options - The options object containing rejectWithValue, getState, and dispatch functions.
 * @returns None
 */
export const addNugget = createAsyncThunk(
  'addNugget',
  async (data, {rejectWithValue, getState, dispatch}) => {
    const uniqueId = getUniqueId();
    dispatch(
      addUpdateUploadingNugget({
        id: uniqueId,
        progressValue: 0,
      }),
    );
    Toast.success('Nugget being uploaded...');
    try {
      data.navigation.goBack();
      // data.navigation.reset({
      //   routes: [{name: 'DashboardProfileTopTabNavigation'}],
      // });
      const res = await addNuggetsService(data.formData, {
        onUploadProgress: progressEvent => {},
        onDownloadProgress: progressEvent => {},
      });

      Toast.success(res.data.msg);
    } catch (error) {
      Toast.fail(error.message);
    } finally {
      dispatch(removeUploadingNugget(uniqueId));
    }
  },
);

/**
 * Asynchronously retrieves a list of all friend groups.
 * @param {any} data - Additional data to be passed to the thunk.
 * @param {object} options - Options object containing rejectWithValue, getState, and dispatch functions.
 * @returns None
 */
export const getAllFriendsGroupsList = createAsyncThunk(
  'getAllFriendsGroupsList',
  async (data, {rejectWithValue, getState, dispatch}) => {
    dispatch(setGroupListLoading(true));
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    try {
      const res = await listAllFriendGroupsService(formData);
      if (res.data.status === 1) {
        dispatch(setGroupsList(res.data.friend_group_list));
      }
    } catch (error) {
    } finally {
      dispatch(setGroupListLoading(false));
    }
  },
);

/**
 * Async thunk action creator that retrieves the list of all friends.
 * @param {any} data - Additional data to be passed to the action.
 * @param {object} options - Options object containing rejectWithValue, getState, and dispatch functions.
 * @returns None
 */
export const getAllFriendsList = createAsyncThunk(
  'getAllFriendsList',
  async (data, {rejectWithValue, getState, dispatch}) => {
    dispatch(setConnectionsListLoading(true));
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('allfriends', 1);
    try {
      const res = await listAllFriendsService(formData);
      if (res.data.status === 1) {
        dispatch(setConnectionsList(res.data.friends_list));
      }
    } catch (error) {
    } finally {
      dispatch(setConnectionsListLoading(false));
    }
  },
);

export const getInfluencersCategoriesList = createAsyncThunk(
  'getInfluencersCategoriesList',
  async (data, {rejectWithValue, getState, dispatch}) => {
    const formData = new FormData();
    formData.append('token', getState().auth.token);
    formData.append('auth_code', getAuthCode(getState().auth.token));
    try {
      const res = await getInfluencerCategoryService(formData);
      if (res.data.status === 1) {
        dispatch(setInfluencerCategoryList(res.data.influencer_category));
      }
    } catch (error) {}
  },
);
