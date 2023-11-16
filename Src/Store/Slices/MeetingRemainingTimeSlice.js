import { createSlice } from "@reduxjs/toolkit";


export const MeetRemainingTime = createSlice({
    name: "meet_remaining_time",
    initialState: {
        value: null
    },
    reducers: {
        setMeetRemainingTime: (state, action) => {
            state.value = action.payload
        }
    }
});
export const { setMeetRemainingTime } = MeetRemainingTime.actions;
export const SelectMeetRemainingTime = (state) => state.meet_remaining_time.value;
export default MeetRemainingTime.reducer;