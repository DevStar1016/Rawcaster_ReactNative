import {createSlice} from '@reduxjs/toolkit';
import {getListNuggets} from '../ThunkAPIServices';
import {htmlDecodeText} from '../../Utilities/Methods';
import {NuggetsListDataProp} from '../SliceTypes/NuggetsListTypes';
import {InfluencerCategoryProp} from '../SliceTypes/HomeTypes';

export const initialState: NuggetsListDataProp = {
  totalPages: {
    influencing: 1,
    forYou: 1,
  },
  nuggetsLoading: {
    influencing: true,
    forYou: true,
  },
  nuggetsErrorMessage: {
    influencing: '',
    forYou: '',
  },
  nuggetsList: {
    influencing: [],
    forYou: [],
  },
};

const NuggetsListSlice = createSlice({
  name: 'NuggetsListSlice',
  initialState,
  reducers: {
    initiateAllNuggetsLoadingTotalPages: (state, action) => {
      if (action.payload) {
        action.payload.categoriesList.map((item: InfluencerCategoryProp) => {
          state.nuggetsLoading[item.name?.split(' ').join('')] = true;
          state.totalPages[item.name?.split(' ').join('')] = 1;
        });
        state.nuggetsLoading.forYou = action.payload.isForYouLoading;
        state.nuggetsLoading.influencing = true;
        state.totalPages.forYou = 1;
        state.totalPages.influencing = 1;
      }
    },
    setNuggetsList: (state, action) => {
      if (action.payload) {
        state.nuggetsList[action.payload.categoryName] =
          action.payload.nuggetsList;
      }
    },
    setNuggetsLoading: (state, action) => {
      if (action.payload) {
        state.nuggetsLoading[action.payload.categoryName] =
          action.payload.status;
      }
    },
    setNuggetsErrorMessage: (state, action) => {
      if (action.payload) {
        state.nuggetsErrorMessage[action.payload.categoryName] =
          action.payload.message;
      }
    },
    resetNuggetsTotalPages: (state, action) => {
      if (action.payload) {
        state.totalPages[action.payload] = 1;
      }
    },
    clearNuggetsListReduxData: (state, action) => {
      return {...initialState};
    },
  },
  extraReducers: builder => {
    builder
      //   .addCase(getListNuggets.pending, (state, action) => {
      //     if (
      //       action.meta.requestId &&
      //       typeof action.meta.requestId === 'object'
      //     ) {
      //       if (action.meta.requestId.categoryName) {
      //         state.nuggetsLoading[action.meta.requestId.categoryName] = true;
      //       }
      //     }
      //   })
      .addCase(getListNuggets.fulfilled, (state, action) => {
        const {categoryName, data, pageNumber} = action.payload;

        if (data.status === 1) {
          let decodedNuggetList = [...data.nuggets_list].map(item => {
            return {
              ...item,
              content: htmlDecodeText(item.content),
              original_user_name: htmlDecodeText(item.original_user_name),
              user_name: htmlDecodeText(item.user_name),
              translated_content: '',
            };
          });
          if (pageNumber === 1) {
            state.totalPages[categoryName] = parseInt(data.total_pages);
            state.nuggetsList[categoryName] = decodedNuggetList;
          } else if (state.nuggetsList[categoryName]) {
            state.nuggetsList[categoryName] = [
              ...state.nuggetsList[categoryName],
              ...decodedNuggetList,
            ];
          }
        } else if (data.status === 0) {
          state.nuggetsErrorMessage[categoryName] = data.msg;
        }
        state.nuggetsLoading[categoryName] = false;
      })
      .addCase(getListNuggets.rejected, (state, action) => {
        // @ts-ignore
        if (action.payload && action.payload.categoryName) {
          // @ts-ignore
          const {categoryName, msg} = action.payload;
          state.nuggetsErrorMessage[categoryName] = msg;
          state.nuggetsLoading[categoryName] = false;
        }
      });
  },
});
export const {
  initiateAllNuggetsLoadingTotalPages,
  setNuggetsList,
  setNuggetsLoading,
  resetNuggetsTotalPages,
  clearNuggetsListReduxData,
  setNuggetsErrorMessage,
} = NuggetsListSlice.actions;
export default NuggetsListSlice.reducer;
