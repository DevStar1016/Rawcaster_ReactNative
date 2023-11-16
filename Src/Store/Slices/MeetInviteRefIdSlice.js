import { createSlice } from "@reduxjs/toolkit";


export const MeetInviteRefIdSlice = createSlice({
    name: "meet_invite_ref_id",
    initialState: {
        value: null
    },
    reducers: {
        setMeetInviteRefId: (state, action) => {
            state.value = action.payload
        }
    }
});
export const { setMeetInviteRefId } = MeetInviteRefIdSlice.actions;
export const SelectMeetingLink = (state) => state.meet_invite_ref_id.value;
export default MeetInviteRefIdSlice.reducer;