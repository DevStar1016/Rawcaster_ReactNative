import { createSlice } from "@reduxjs/toolkit";


export const MeetingExistSlice = createSlice({
    name: "meetingExit",
    initialState: {
        value: true,
    },
    reducers: {
        setExistFromHost: (state, action) => {
            state.value = action.payload
        }
    }
});
export const { setExistFromHost } = MeetingExistSlice.actions;
//export const SelectUser = (state)=>state.user_info.value;
export default MeetingExistSlice.reducer;