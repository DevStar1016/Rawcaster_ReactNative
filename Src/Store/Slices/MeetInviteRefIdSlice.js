import { createSlice } from "@reduxjs/toolkit";


export const MeetInviteRefIdSlice = createSlice({
    name: "meet_invite_ref_id",
    initialState: {
        meeting_ref_id: null,
        talkshow_ref_id: null,
    },
    reducers: {
        setMeetInviteRefId: (state, action) => {
            state.meeting_ref_id = action.payload
        },
        setTalkShowInviteRefId: (state, action) => {
            state.talkshow_ref_id = action.payload
        }
    }
});
export const { setMeetInviteRefId, setTalkShowInviteRefId } = MeetInviteRefIdSlice.actions;
//export const SelectMeetingLink = (state) => state.meet_invite_ref_id.value;
export default MeetInviteRefIdSlice.reducer;