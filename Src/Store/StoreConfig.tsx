import {configureStore} from '@reduxjs/toolkit';
import AuthSlice from './Slices/AuthSlice';
import HomeSlice from './Slices/HomeSlice';
import NuggetActionsSlice from './Slices/NuggetActionsSlice';
import UtilitySlice from './Slices/UtilitySlice';
import NuggetsListSlice from './Slices/NuggetsListSlice';
import MeetingExitSlice from './Slices/MeetingExitSlice';
import MeetingRemainingTimeSlice from './Slices/MeetingRemainingTimeSlice';
import MeetInviteRefIdSlice from './Slices/MeetInviteRefIdSlice';
export const store = configureStore({
  reducer: {
    auth: AuthSlice,
    utility: UtilitySlice,
    home: HomeSlice,
    nugget_actions: NuggetActionsSlice,
    nugget_list_data: NuggetsListSlice,
    meeting_exit_slice:MeetingExitSlice,
    meet_remaining_time_slice:MeetingRemainingTimeSlice,
    meeting_invite_refId:MeetInviteRefIdSlice
  },
});
export type RootState = ReturnType<typeof store.getState>;
