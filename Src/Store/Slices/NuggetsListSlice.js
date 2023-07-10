import {createSlice} from '@reduxjs/toolkit';
import {getListNuggets} from '../ThunkAPIServices';
import {htmlDecodeText} from '../../Utilities/Methods';

export const initialState = {
  totalPages: {
    influencing: 1,
    forYou: 1,
  },
  nuggetsLoading: {
    influencing: true,
    forYou: true,
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
        action.payload.map(item => {
          state.nuggetsLoading[item.name?.split(' ').join('')] = true;
          state.totalPages[item.name?.split(' ').join('')] = 1;
        });
        state.nuggetsLoading.forYou = true;
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
    resetNuggetsTotalPages: (state, action) => {
      if (action.payload) {
        state.totalPages[action.payload] = 1;
      }
    },
    clearNuggetsListReduxData: (state, action) => {
      state = {...initialState};
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
        }
        state.nuggetsLoading[categoryName] = false;
      })
      .addCase(getListNuggets.rejected, (state, action) => {
        if (action.payload && action.payload.categoryName) {
          const {categoryName} = action.payload;
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
} = NuggetsListSlice.actions;
export default NuggetsListSlice.reducer;
